import { AlarmInfo } from './../alarm-info/models/alarm-info.model';
import { Component, OnDestroy } from '@angular/core';
// tslint:disable-next-line:max-line-length
import { icon, latLng, Map, marker, tileLayer, TileLayer, LeafletMouseEvent, Marker, LayerGroup, circle, MapOptions, LatLngTuple } from 'leaflet';
import { OverpassService } from './services/overpass.service';
import { MarkerCreatorService } from './services/marker-creator.service';
import { AlarmObserverService } from '../alarm-info/services/alarm-observer.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment.prod';

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

    private ziel: Marker = marker([49.527352, 10.487624], {
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
        zoom: 15,
        center: latLng([environment.navigationStartPoint.lat, environment.navigationStartPoint.lng]),
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

        this.alarmInfoSubscription = this.alarmObserver.alarmInfoAnnounced$.subscribe(data => {
            let alarmInfo = data;

            if (alarmInfo) {
                console.log('[HydrantplanComponent] got alarmInfoAnnounced');
            } else {
                console.log('[HydrantplanComponent] got alarmInfoAnnounced with no alarm info data, try to use cached one');
                alarmInfo = this.alarmObserver.currentAlarmInfo;
            }

            this.updateMap(alarmInfo);
        },
        error => {
            console.error(error);

            this.updateMap(null);
        },
        () => {
            console.log('[HydrantplanComponent] alarmInfoAnnounced completed');
        });

        console.log('[HydrantplanComponent] initial rendering the current active alarmInfo');
        this.updateMap(this.alarmObserver.currentAlarmInfo);
    }

    private updateMap(alarmInfo: AlarmInfo): void {
        if (this.map === null) {
            console.warn('[HydrantplanComponent] map not ready to show informations');
            return;
        }

        let incomingGeoPosition: LatLngTuple = null;

        if (alarmInfo === null || alarmInfo === undefined ||
            alarmInfo.placeOfAction === null || alarmInfo.placeOfAction === undefined) {
            console.log('[HydrantplanComponent] alarm info is not set -> reset marker to home');

            incomingGeoPosition = [Number(environment.navigationStartPoint.lat), Number(environment.navigationStartPoint.lng)];
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
