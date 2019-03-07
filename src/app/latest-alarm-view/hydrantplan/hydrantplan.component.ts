import { AppConfig } from './../../services/app-config.service';
import { AlarmInfo } from './../alarm-info/models/alarm-info.model';
import { Component, OnDestroy } from '@angular/core';
// tslint:disable-next-line:max-line-length
import { icon, latLng, Map, marker, tileLayer, TileLayer, LeafletMouseEvent, Marker, LayerGroup, circle, MapOptions, LatLngTuple } from 'leaflet';
import { OverpassService } from './services/overpass.service';
import { MarkerCreatorService } from './services/marker-creator.service';
import { AlarmObserverService } from '../alarm-info/services/alarm-observer.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-hydrantplan',
    templateUrl: './hydrantplan.component.html',
    styleUrls: ['./hydrantplan.component.css']
})
export class HydrantplanComponent implements OnDestroy {
    public title = 'Hydrantenplan';

    private zoomLevel = 17;

    private googleMaps: TileLayer = tileLayer(
        'http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
        {
            maxZoom: 20,
            subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
            detectRetina: true
        }
    );

    private openStreetMap: TileLayer = tileLayer(
        'https://{s}.tile.openstreetmap.de/tiles/osmde/{z}/{x}/{y}.png',
        {
            attribution: '',
            detectRetina: true,
            maxZoom: 18
        }
    );

    private ziel: Marker = marker([AppConfig.settings.navigation.startPoint.lat, AppConfig.settings.navigation.startPoint.lng], {
        icon: icon({
            iconSize: [25, 41],
            iconAnchor: [13, 41],
            iconUrl: 'leaflet/marker-icon.png',
            shadowUrl: 'leaflet/marker-shadow.png'
        })
    });

    private radiusCircle = circle(this.ziel.getLatLng(), {
        radius: 100
    });

    layersControl = {
        baseLayers: {
            'Google Maps': this.googleMaps,
            OpenStreetMap: this.openStreetMap
        },
        overlays: {
            Ziel: this.ziel,
            Einsatzradius: this.radiusCircle
        }
    };

    options: MapOptions = {
        layers: [this.openStreetMap, this.ziel, this.radiusCircle],
        zoom: this.zoomLevel,
        center: latLng([AppConfig.settings.navigation.startPoint.lat, AppConfig.settings.navigation.startPoint.lng]),
        zoomControl: null
    };

    private map: Map;
    private alarmInfoSubscription: Subscription;

    constructor(
        private overpassService: OverpassService,
        private markerCreator: MarkerCreatorService,
        private alarmObserver: AlarmObserverService
    ) {}

    ngOnDestroy() {
        this.alarmInfoSubscription.unsubscribe();
    }

    public onMapReady(map: Map): void {
        this.map = map;

        this.alarmInfoSubscription = this.alarmObserver.getAlarmInfo().subscribe(alarmInfo => {

            if (alarmInfo != null) {
                console.log('[HydrantplanComponent] got alarmInfoAnnounced');

                this.updateMap(alarmInfo);
            } else {
                this.updateMap(null);
            }
        },
        error => {
            console.error(error);

            this.updateMap(null);
        },
        () => {
            console.log('[HydrantplanComponent] alarmInfoAnnounced completed');
        });
    }

    private updateMap(alarmInfo: AlarmInfo): void {
        if (this.map == null) {
            console.warn('[HydrantplanComponent] map not ready to show informations');
            return;
        }

        let incomingGeoPosition: LatLngTuple = null;

        if (alarmInfo == null || alarmInfo.placeOfAction == null) {
            console.log('[HydrantplanComponent] alarm info is not set -> reset marker to home');

            incomingGeoPosition = [AppConfig.settings.navigation.startPoint.lat, AppConfig.settings.navigation.startPoint.lng];
        } else {
            const position = alarmInfo.placeOfAction.geoPosition;
            incomingGeoPosition = [Number(position.lat), Number(position.lng)];
        }

        console.log(`[HydrantplanComponent] set destination to: [${incomingGeoPosition[0]}; ${incomingGeoPosition[1]}]`);

        this.ziel.setLatLng(incomingGeoPosition);
        this.options.center = latLng(incomingGeoPosition);

        this.radiusCircle.setLatLng(incomingGeoPosition);
        this.markerCreator
            .mapToHydrantMarker(this.overpassService.getHydrantMarkers(this.map.getBounds()))
            .then(m => {
                const group = new LayerGroup(m);
                this.map.addLayer(group);
                this.layersControl.overlays['Hydranten'] = group;
            })
            .catch(error => console.log(error));

        this.map.setView(incomingGeoPosition, this.options.zoom, this.options);

        if (!this.map.hasEventListeners('click')) {
            this.map.addEventListener('click', this.onClick);
        }
    }

    public onClick(event: LeafletMouseEvent): void {
        console.log(event.latlng);
    }
}
