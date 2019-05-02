/// <reference types="@types/googlemaps" />

import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { MouseEvent, MapsAPILoader, LAZY_MAPS_API_CONFIG } from '@agm/core';
import { AlarmObserverService } from '../alarm-info/services/alarm-observer.service';
import { Subscription } from 'rxjs';
import { AlarmInfo } from './../alarm-info/models/alarm-info.model';
import { AppConfig } from '../../services/app-config.service';

@Component({
    selector: 'app-navigation',
    templateUrl: './navigation.component.html',
    styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit, OnDestroy {
    public title = 'Einsatz Navigation';
    public zoom = 17;
    public dir: any = undefined;
    public startLocation = AppConfig.settings.navigation.startPoint;

    private origin = AppConfig.settings.navigation.startPoint;
    private alarmInfoSubscription: Subscription;

    constructor(
        @Inject(LAZY_MAPS_API_CONFIG) config: any,
        private mapsAPILoader: MapsAPILoader,
        private alarmObserver: AlarmObserverService
    ) {
        if (config) {
            config.apiKey = AppConfig.settings.googleMapsKey;
        }
    }

    ngOnInit() {
        // load places autocomplete
        this.mapsAPILoader.load().then(() => {
            this.alarmInfoSubscription = this.alarmObserver.getAlarmInfo().subscribe(alarmInfo => {

                if (alarmInfo) {
                    console.log('[NavigationComponent] got alarm info announced');
                } else {
                    console.log('[NavigationComponent] got alarm info announced with no alarm info data');
                }

                this.renderDirections(alarmInfo);
            },
            error => {
                console.error(error);

                this.renderDirections(null);
            },
            () => {
                console.log('[NavigationComponent] alarm info announced completed');
            });
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

        if (incomingWgs84Position) {
            console.log(`[NavigationComponent] route to lat: ${incomingWgs84Position.lat}; lng: ${incomingWgs84Position.lng}`);

            this.dir = {
                origin: this.origin,
                destination: incomingWgs84Position,
                travelMode: google.maps.TravelMode.DRIVING
            };
        } else {
            console.log('[NavigationComponent] incomingWgs84Position is not defined -> unable to route');
        }
    }

    onMapClicked(event: MouseEvent) {
        console.log('[NavigationComponent]', event.coords);
    }
}
