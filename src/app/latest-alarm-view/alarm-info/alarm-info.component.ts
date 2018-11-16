import { map } from 'rxjs/operators';
import { AbekService } from './services/abek.service';
import { AlarmContent } from './alarm-content';
import { Component, OnInit } from '@angular/core';
import { AlarmItem } from './services/alarm-item';
import { AlarmObserverService } from './services/alarm-observer.service';

@Component({
    selector: 'app-alarm-info',
    templateUrl: './alarm-info.component.html',
    styleUrls: ['./alarm-info.component.css']
})
export class AlarmInfoComponent implements OnInit {
    public alarmInfo: AlarmContent;
    public abekInfo: AlarmItem;

    constructor(
        private abekService: AbekService,
        private alarmObserverService: AlarmObserverService
    ) {}

    ngOnInit() {
        // this.alarmInfo = {
        //     Alarmzeit: new Date(2018, 4, 4, 15, 33, 27),
        //     Einsatzort: 'Am Kuhwasen 2, 91472 Ipsheim',
        //     Schlagwort: '#B1710#Meldeanlage#Brandmeldeanlage',
        //     Prioritaet: 1,
        //     Bemerkung: '51236122-03: 5.1.3 NEA Camp'
        // };

        this.alarmObserverService.getInitialAlarmInfo().subscribe(
            this.updateCurrentAlarmInfo(),
            error => {
                console.error(error);
            },
            () => {
                console.log('query initial alarm info complete');
            }
        );

        this.alarmObserverService.getUpdates().subscribe(
            this.updateCurrentAlarmInfo(),
            error => {
                console.error(error);
            },
            () => {
                console.log('query update alarm info complete');
            }
        );
    }

    private updateCurrentAlarmInfo(): (value: AlarmItem) => void {
        return alarmInfo => {
            this.alarmInfo = alarmInfo;
            this.abekService
                .getAlarmItem(alarmInfo.Schlagwort)
                .then(data => {
                    this.abekInfo = data;
                })
                .catch(error => console.error(error));
        };
    }
}
