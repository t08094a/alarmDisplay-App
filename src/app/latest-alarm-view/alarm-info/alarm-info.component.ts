import { Subscription } from 'rxjs';
import { AbekService } from './services/abek.service';
import { AlarmInfo } from './models/alarm-info.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { AbekItem } from './models/abek-item.model';
import { AlarmObserverService } from './services/alarm-observer.service';

@Component({
    selector: 'app-alarm-info',
    templateUrl: './alarm-info.component.html',
    styleUrls: ['./alarm-info.component.css']
})
export class AlarmInfoComponent implements OnInit, OnDestroy {
    private alarmInfoSubscription: Subscription;
    public alarmInfo: AlarmInfo;
    public abekInfo: AbekItem;

    constructor(
        private abekService: AbekService,
        private alarmObserverService: AlarmObserverService
    ) {}

    ngOnInit() {
        this.alarmInfoSubscription = this.alarmObserverService.alarmInfoAnnounced$.subscribe(
            data => {
                console.log('[AlarmInfoComponent] got current alarm info initial alarm info response');

                this.updateCurrentAlarmInfo(data);
            },
            error => {
                console.error(error);
            },
            () => {
                console.log('[AlarmInfoComponent] got current alarm info completed');
            }
        );

        // tslint:disable-next-line:max-line-length
        console.log('[AlarmInfoComponent] initial display current active alarmInfo');
        this.updateCurrentAlarmInfo(this.alarmObserverService.currentAlarmInfo);
    }

    ngOnDestroy(): void {
        this.alarmInfoSubscription.unsubscribe();
    }

    private updateCurrentAlarmInfo(value: AlarmInfo) {
        console.log('[AlarmInfoComponent] incomming alarm info:', value);

        this.alarmInfo = value;

        // update Abek information
        if ((value != null || value !== undefined) && value.keywords && value.keywords.keyword) {
            console.log('[AlarmInfoComponent] query Abek for current alarm info');

            this.abekService
                .getAbekItem(value.keywords.keyword)
                .then(data => {
                    console.log('[AlarmInfoComponent] response from Abek service:', data);
                    this.abekInfo = data;
                })
                .catch(error => {
                    console.warn(error);
                    this.abekInfo = null;
                });
        } else {
            this.abekInfo = null;
        }
    }
}
