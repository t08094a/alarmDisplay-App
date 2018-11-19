import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, OnDestroy } from '@angular/core';
import { Observable, Subject, from } from 'rxjs';
import * as socketio from 'socket.io-client';

import { environment } from './../../../../environments/environment';
import { AlarmInfo } from '../models/alarm-info.model';

@Injectable({providedIn: 'root'})
export class AlarmObserverService implements OnDestroy {
    private dataserverUrl: string;
    private apiCurrentAlarmInfo: string;
    private eventKey: string;
    private socket: SocketIOClient.Socket;
    private currentAlarmInfoSource: Subject<AlarmInfo> = new Subject<AlarmInfo>();

    // observable alarm info stream
    public alarmInfoAnnounced$ = this.currentAlarmInfoSource.asObservable();

    constructor(
        private httpClient: HttpClient
    ) {
        this.dataserverUrl = `${environment.dataserver.url}:${environment.dataserver.port}`;
        this.apiCurrentAlarmInfo = `${environment.dataserver.restApi.currentAlarmInfo}`;
        this.eventKey = environment.dataserver.websocket.alarmInfoEventKey;

        this.initialize();
    }

    initialize() {
        this.getInitialAlarmInfo();

        this.socket = socketio(this.dataserverUrl);

        this.socket.io.addEventListener('connection', () => {
            console.log(`[AlarmObserverService] connected to socket.io ${this.dataserverUrl}`);
        });
        this.socket.io.addEventListener('disconnect', () => {
            console.log(`[AlarmObserverService] disconnected from socket.io ${this.dataserverUrl}`);
        });

        // this.socket.open();

        // if (!this.socket.connected) {
        //     console.log(`[AlarmObserverService] connect to socket.io ${this.dataserverUrl}`);
        //     this.socket.connect();
        // }

        this.getUpdates();
    }

    ngOnDestroy(): void {
        this.socket.disconnect();
    }

    // Service message commands
    private announceAlarmInfo(alarmInfo: AlarmInfo): void {
        this.currentAlarmInfoSource.next(alarmInfo);
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

        // We define our observable which will observe any incoming messages from our alarminfo data server.
        this.socket.io.on(this.eventKey, (data: AlarmInfo) => {
            console.log(`[AlarmObserverService] received "${this.eventKey}" from Websocket Server:\n${data}`);

            this.updateCurrentAlarmInfo(data);
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

        if (currentAlarmInfoTmp) {
            console.log('[AlarmObserverService] incomming alarm info:', currentAlarmInfoTmp);

            if (currentAlarmInfoTmp.placeOfAction) {

                // tslint:disable-next-line:max-line-length
                let combinedAddress = `${currentAlarmInfoTmp.placeOfAction.street} ${currentAlarmInfoTmp.placeOfAction.houseNumber} ${currentAlarmInfoTmp.placeOfAction.addition}, ${currentAlarmInfoTmp.placeOfAction.city}`;
                combinedAddress = combinedAddress.trim().replace(/\s+/g, ' ');
                currentAlarmInfoTmp.placeOfAction.adressAsCombinedString = combinedAddress;
            }
        }

        this.announceAlarmInfo(currentAlarmInfoTmp);
    }
}
