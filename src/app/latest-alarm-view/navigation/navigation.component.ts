/// <reference types="@types/googlemaps" />

import { Component, NgZone, OnInit, OnDestroy } from '@angular/core';
import { MouseEvent, MapsAPILoader, LatLng } from '@agm/core';
import { GMapsService } from './gmaps-service.service';
import { AlarmObserverService } from '../alarm-info/services/alarm-observer.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { PlaceOfAction } from '../alarm-info/models/placeOfAction.model';
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
    private alarmInfoSubscription: Subscription;

    constructor(
        private mapsAPILoader: MapsAPILoader,
        private gMapsService: GMapsService,
        private __zone: NgZone,
        private alarmObserver: AlarmObserverService
    ) {}

    ngOnInit() {
        // load places autocomplete
        this.mapsAPILoader.load().then(() => {
            this.alarmInfoSubscription = this.alarmObserver.alarmInfoAnnounced$.subscribe(data => {
                let alarmInfo = data;

                if (alarmInfo) {
                    console.log('[NavigationComponent] got alarmInfoAnnounced');
                } else {
                    console.log('[NavigationComponent] got alarmInfoAnnounced with no alarm info data');
                    alarmInfo = this.alarmObserver.currentAlarmInfo;
                }

                this.renderDirections(alarmInfo);
            },
            error => {
                console.error(error);

                this.renderDirections(null);
            },
            () => {
                console.log('[NavigationComponent] alarmInfoAnnounced completed');
            });

            // tslint:disable-next-line:max-line-length
            console.log('[NavigationComponent] initial rendering the current active alarmInfo');
            this.renderDirections(this.alarmObserver.currentAlarmInfo);
        });
    }

    ngOnDestroy(): void {
        this.alarmInfoSubscription.unsubscribe();
    }

    ngOnChange() {
        this.renderDirections(null);
    }

    private renderDirections(alarmInfo: AlarmInfo) {
        if (alarmInfo === null || alarmInfo === undefined ||
            alarmInfo.placeOfAction === null || alarmInfo.placeOfAction === undefined) {

            this.dir = null;

            return;
        }

        const incomingWgs84Position = alarmInfo.placeOfAction.geoPosition;

        if (incomingWgs84Position !== null && incomingWgs84Position !== undefined) {
            console.log(`[NavigationComponent] route to lat: ${incomingWgs84Position.lat}; lng: ${incomingWgs84Position.lng}`);

            this.dir = {
                origin: this.origin,
                destination: incomingWgs84Position,
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
