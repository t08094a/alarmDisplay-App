import { AppConfig } from './services/app-config.service';
import { AlarmObserverService } from './latest-alarm-view/alarm-info/services/alarm-observer.service';
import { environment } from './../environments/environment';
import { Component, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css'],
    providers: [AlarmObserverService]
})
export class AppComponent implements OnDestroy {
    private alarmInfoSubscription: Subscription;
    title: string = AppConfig.settings.applicationTitle;
    appVersion: string = environment.VERSION;
    production: string = environment.production ? 'production' : 'development';

    public constructor(alarmObserver: AlarmObserverService,
                       private titleService: Title,
                       private router: Router) {
        this.titleService.setTitle(AppConfig.settings.applicationTitle);

        this.alarmInfoSubscription = alarmObserver.getAlarmInfo().subscribe(alarmInfo => {
            if (alarmInfo) {
                console.log('[AppComponent] received new alarm info -> show alarm info page');
                this.navigateTo('alarm-info');
            } else {
                console.log('[AppComponent] received no alarm info -> show common infos page');
                this.navigateTo('common-info');
            }
        });
    }

    ngOnDestroy(): void {
        this.alarmInfoSubscription.unsubscribe();
    }

    private navigateTo(page: string) {
        console.log(`[AppComponent] navigate to ${page}`);
        this.router.navigateByUrl(page);
    }
}
