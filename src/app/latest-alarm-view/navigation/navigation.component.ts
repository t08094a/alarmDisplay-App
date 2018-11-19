/// <reference types="@types/googlemaps" />

import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { MouseEvent, MapsAPILoader, LatLng } from '@agm/core';
import { GMapsService } from './gmaps-service.service';
import { AlarmObserverService } from '../alarm-info/services/alarm-observer.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlaceOfAction } from '../alarm-info/models/placeOfAction.model';
import { GeoTransformatorService } from './../alarm-info/services/geo-transformator.service';
import { AlarmInfo } from './../alarm-info/models/alarm-info.model';

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css'],
    providers: [GMapsService]
})
export class NavigationComponent implements OnInit, OnDestroy {
    public title = 'Einsatz Navigation';
    public zoom = 17;
    public dir: any = undefined;
    public startLocation = environment.navigationStartPoint;

    private origin = environment.navigationStartPoint;
    private address = 'Am Schießwasen 2, 91438 Bad Windsheim';
    private alarmInfoSubscription: Subscription;

    constructor(
        private mapsAPILoader: MapsAPILoader,
        private gMapsService: GMapsService,
        private __zone: NgZone,
        private alarmObserverService: AlarmObserverService,
        private geoTransformationService: GeoTransformatorService
    ) {}

    ngOnInit() {
        // load places autocomplete
        this.mapsAPILoader.load().then(() => {
            this.renderDirections(null);
        });

        this.alarmInfoSubscription = this.alarmObserverService.alarmInfoAnnounced$.subscribe(
            data => {
                console.log('[NavigationComponent] got alarmInfoAnnounced');

                this.renderDirections(data);
            },
            error => {
                console.error(error);

                this.renderDirections(null);
            },
            () => {
                console.log('[NavigationComponent] alarmInfoAnnounced completed');
            }
        );
    }

    ngOnDestroy(): void {
        this.alarmInfoSubscription.unsubscribe();
    }

    ngOnChange() {
        this.renderDirections(null);
    }

    renderDirections(alarmInfo: AlarmInfo) {
        if (alarmInfo === null || alarmInfo === undefined ||
            alarmInfo.placeOfAction === null && alarmInfo.placeOfAction === undefined) {

            this.dir = null;

            return;
        }

        const incomingGeoPosition = alarmInfo.placeOfAction.geoPosition;

        if (incomingGeoPosition !== null && incomingGeoPosition !== undefined) {
            // get lat lng based on given Gauß Krüger coordinates
            const east = incomingGeoPosition.x;
            const north = incomingGeoPosition.y;

            const wgs84Position = this.geoTransformationService.transformGaussKruegerToWsg84(east, north);

            console.log(`[NavigationComponent] route to LatLng: ${wgs84Position}`);

            this.dir = {
                origin: this.origin,
                destination: wgs84Position,
                travelMode: google.maps.TravelMode.DRIVING
            };
        } else {
            // get lat lng based on the address
            this.setRoutingTargetBasedOnAddress(alarmInfo.placeOfAction);
        }
    }

    private setRoutingTargetBasedOnAddress(placeOfAction: PlaceOfAction) {
        console.log(`[NavigationComponent] get LatLng for ${placeOfAction.adressAsCombinedString}`);

        this.gMapsService.getLatLng(placeOfAction.adressAsCombinedString).subscribe(result => {
            this.__zone.run(() => {
                const destinationLatLng = {
                    lat: result.lat(),
                    lng: result.lng()
                };
                console.log(`[NavigationComponent] Found LatLng: ${destinationLatLng}`);
                this.dir = {
                    origin: this.origin,
                    destination: destinationLatLng,
                    travelMode: google.maps.TravelMode.DRIVING
                };
            });
        }, error => console.log(error), () => console.log('[NavigationComponent] Get LatLng based on destination address completed!'));
    }

    onMapClicked(event: MouseEvent) {
        console.log('[NavigationComponent]', event.coords);
    }
}
