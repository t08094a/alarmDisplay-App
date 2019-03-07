import { HttpClient } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

import { AlarmInfo } from './../models/alarm-info.model';
import { GeoTransformatorService } from './geo-transformator.service';
import { AppConfig } from '../../../services/app-config.service';
import { SocketLatestAlarmInfo } from './socket-latest-alarm-info';

@Injectable({providedIn: 'root'})
export class AlarmObserverService implements OnDestroy {
    private dataserverUrl: string;
    private apiCurrentAlarmInfo: string;
    private eventKey: string;
    // use of BehaviorSubject to get always the last value in cache, initialize it with null
    private currentAlarmInfoSource: BehaviorSubject<AlarmInfo> = new BehaviorSubject<AlarmInfo>(null);

    constructor(private httpClient: HttpClient,
                private socket: SocketLatestAlarmInfo,
                private geoTransformationService: GeoTransformatorService) {
        this.dataserverUrl = `${AppConfig.settings.dataserver.url}:${AppConfig.settings.dataserver.port}`;
        this.apiCurrentAlarmInfo = `${AppConfig.settings.dataserver.restResources.currentAlarmInfo}`;
        this.eventKey = AppConfig.settings.dataserver.websocket.alarmInfoEventKey;

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

        this.currentAlarmInfoSource.complete();
    }

    /**
     * Gets the alarm infos as {Observable<AlarmInfo>}. {null} is an allowed value.
     * @returns {Observable<AlarmInfo>}
     * @memberof AlarmObserverService
     */
    public getAlarmInfo(): Observable<AlarmInfo> {
        return this.currentAlarmInfoSource.asObservable();
    }

    // Service message commands
    private announceAlarmInfo(alarmInfo: AlarmInfo): void {
        if (alarmInfo == null) {
            return;
        }

        this.transformGKtoWks84Coordinats(alarmInfo);

        console.log('[AlarmObserverService] publish the alarm info to observing components');
        this.currentAlarmInfoSource.next(alarmInfo);
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
