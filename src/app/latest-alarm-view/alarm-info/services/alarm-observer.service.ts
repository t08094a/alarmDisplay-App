import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Subject, timer } from 'rxjs';
import { Socket } from 'ngx-socket-io';

import { environment } from './../../../../environments/environment';
import { AlarmInfo } from './../models/alarm-info.model';
import { takeUntil } from 'rxjs/operators';
import { GeoTransformatorService } from './geo-transformator.service';

@Injectable({providedIn: 'root'})
export class AlarmObserverService implements OnDestroy {
    private dataserverUrl: string;
    private apiCurrentAlarmInfo: string;
    private eventKey: string;
    private currentAlarmInfoSource: Subject<AlarmInfo> = new Subject<AlarmInfo>();
    private unsubscribeTimer = new Subject();
    public currentAlarmInfo: AlarmInfo;

    // observable alarm info stream
    public alarmInfoAnnounced$ = this.currentAlarmInfoSource.asObservable();

    constructor(
        private httpClient: HttpClient,
        private socket: Socket,
        private geoTransformationService: GeoTransformatorService
    ) {
        this.dataserverUrl = `${environment.dataserver.url}:${environment.dataserver.port}`;
        this.apiCurrentAlarmInfo = `${environment.dataserver.restApi.currentAlarmInfo}`;
        this.eventKey = environment.dataserver.websocket.alarmInfoEventKey;

        this.initialize();
    }

    initialize() {
        this.getInitialAlarmInfo();

        this.socket.ioSocket.addEventListener('connection', () => {
            console.log(`[AlarmObserverService] connected to socket.io ${this.dataserverUrl}`);
        });
        this.socket.ioSocket.addEventListener('disconnect', () => {
            console.log(`[AlarmObserverService] disconnected from socket.io ${this.dataserverUrl}`);
        });

        this.getUpdates();
    }

    ngOnDestroy(): void {
        this.socket.disconnect();

        this.unsubscribeTimer.next();
        this.unsubscribeTimer.complete();
    }

    // Service message commands
    private announceAlarmInfo(alarmInfo: AlarmInfo): void {

        this.transformGKtoWks84Coordinats(alarmInfo);
        this.currentAlarmInfo = alarmInfo;

        console.log('[AlarmObserverService] publish the alarm info to internal components');
        this.currentAlarmInfoSource.next(alarmInfo);

        if (alarmInfo !== null || alarmInfo !== undefined) {
            // reset after 15 minutes = 900000
            timer(900000, 900000).pipe(takeUntil(this.unsubscribeTimer)).subscribe(t => {
                console.log('[AlarmObserverService] timer event occured -> reset current alarm info');

                this.currentAlarmInfo = null;
                this.currentAlarmInfoSource.next(alarmInfo);

                console.log('[AlarmObserverService] reset timer');
                this.unsubscribeTimer.next();
            });
        } else {
            // terminate current timers
            this.unsubscribeTimer.next();

            console.log('[AlarmObserverService] reset timer event');
        }
    }

    private transformGKtoWks84Coordinats(alarmInfo: AlarmInfo): void {
        if (alarmInfo === null || alarmInfo === undefined ||
            alarmInfo.placeOfAction === null || alarmInfo.placeOfAction === undefined ||
            alarmInfo.placeOfAction.geoPosition === null || alarmInfo.placeOfAction.geoPosition === undefined) {
            return;
        }

        const incomingGeoPosition = alarmInfo.placeOfAction.geoPosition;

        // get lat lng based on given Gauß Krüger coordinates
        const east = incomingGeoPosition.x;
        const north = incomingGeoPosition.y;

        const wgs84Position = this.geoTransformationService.transformGaussKruegerToWsg84(east, north);

        // tslint:disable-next-line:max-line-length
        console.log(`[AlarmObserverService] transformed GK [east: ${east}; north: ${north}] to WGS84: [lat: ${wgs84Position.lat}; lng: ${wgs84Position.lng}]`);

        alarmInfo.placeOfAction.geoPosition.lat = wgs84Position.lat;
        alarmInfo.placeOfAction.geoPosition.lng = wgs84Position.lng;
    }

    /**
     * Queries if there occured an alarm info in the last 15 minutes.
     *
     * @memberof AlarmObserverService
     */
    private getInitialAlarmInfo(): void {
        console.log('[AlarmObserverService] get initial alarm info from last 15 minutes');

        const apiResource = `${this.dataserverUrl}${this.apiCurrentAlarmInfo}`;
        this.httpClient.get<AlarmInfo>(apiResource).subscribe(data => {
            console.log('[AlarmObserverService] query initial alarm info response:', data);

            this.updateCurrentAlarmInfo(data);
        },
        error => {
            console.error(error);
        },
        () => {
            console.log('[AlarmObserverService] query initial alarm info completed');
        });
    }

    private getUpdates(): void {
        console.log('[AlarmObserverService] get alarm info updates');

        this.socket.fromEvent<string>(this.eventKey).subscribe(data => {
            console.log(`[AlarmObserverService] received "${this.eventKey}" from Websocket Server:\n${data}`);

            const alarmInfo: AlarmInfo = JSON.parse(data);

            this.updateCurrentAlarmInfo(alarmInfo);
        },
        error => {
            console.error(error);
        },
        () => {
            console.log('[AlarmObserverService] get updates query completed');
        });
    }

    private updateCurrentAlarmInfo(value: AlarmInfo) {

        let currentAlarmInfoTmp: AlarmInfo = null;

        if (Array.isArray(value)) {
            console.log('[AlarmObserverService] incomming alarm is an array -> get only latest one');

            if (Array.length === 0) {
                console.log('[AlarmObserverService] array is empty');
            } else {
                currentAlarmInfoTmp = value.sort((a: AlarmInfo, b: AlarmInfo) => {
                    return a.time.getTime() - b.time.getTime();
                }).pop();
            }
        } else {
            currentAlarmInfoTmp = value;
        }

        if (currentAlarmInfoTmp && currentAlarmInfoTmp.placeOfAction) {
            // tslint:disable-next-line:max-line-length
            let combinedAddress = `${currentAlarmInfoTmp.placeOfAction.street} ${currentAlarmInfoTmp.placeOfAction.houseNumber} ${currentAlarmInfoTmp.placeOfAction.addition}, ${currentAlarmInfoTmp.placeOfAction.city}`;
            combinedAddress = combinedAddress.trim().replace(/\s+/g, ' ');
            currentAlarmInfoTmp.placeOfAction.adressAsCombinedString = combinedAddress;
        }

        this.announceAlarmInfo(currentAlarmInfoTmp);
    }
}
