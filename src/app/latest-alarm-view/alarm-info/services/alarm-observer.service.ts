import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
// import { Router, NavigationEnd } from '@angular/router';
import { Observable, Subject, from } from 'rxjs';
import * as socketio from 'socket.io-client';

import { environment } from './../../../../environments/environment';
import { AlarmItem } from './alarm-item';

@Injectable({providedIn: 'root'})
export class AlarmObserverService {
    private dataserverUrl: string;
    private apiCurrentAlarmInfo: string;
    private eventKey: string;

    constructor(
        // private router: Router,
        private httpClient: HttpClient
    ) {
        console.log('>>> initialize AlarmObserverService');
        this.dataserverUrl = `${environment.dataserver.url}:${environment.dataserver.port}`;
        this.apiCurrentAlarmInfo = `${environment.dataserver.restApi.currentAlarmInfo}`;
        this.eventKey = environment.dataserver.websocket.alarmInfoEventKey;
    }

    /**
     * Queries if there occured an alarm info in the last 15 minutes.
     *
     * @returns {Observable<AlarmItem[]>}
     * @memberof AlarmObserverService
     */
    getInitialAlarmInfo(): Observable<AlarmItem> {
        console.log('>>> execute AlarmObserverService.getInitialAlarmInfo');

        const apiResource = `${this.dataserverUrl}${this.apiCurrentAlarmInfo}`;
        return this.httpClient.get<AlarmItem>(apiResource);
    }

    getUpdates(): Observable<AlarmItem> {
        console.log('>>> execute AlarmObserverService.getUpdates');

        const socket = socketio(this.dataserverUrl);
        const alarmInfoSubject = new Subject<AlarmItem>();
        const alarmInfoObservable = from(alarmInfoSubject);

        // We define our observable which will observe any incoming messages from our alarminfo data server.
        socket.on(this.eventKey, (data: AlarmItem) => {
            console.log(`Received "${this.eventKey}" from Websocket Server:\n${data}`);

            alarmInfoSubject.next(data);
        });

        return alarmInfoObservable;
    }
}
