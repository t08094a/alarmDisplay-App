import { EventItem } from './event-item';
import { EventService } from './services/event-service';
import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
    selector: 'app-termine-view',
    templateUrl: './termine-view.component.html',
    styleUrls: ['./termine-view.component.css']
})
export class TermineViewComponent implements OnInit, OnDestroy {
    private interval: any;
    public events: EventItem[] = [];

    constructor(private eventService: EventService) {
    }

    ngOnInit() {
        this.refreshData();

        this.interval = setInterval(() => {
            console.log('[TermineViewComponent] interval occured -> refresh data');
            this.refreshData();
        }, 1800000); // refresh all 30 minutes
    }

    ngOnDestroy() {
        clearInterval(this.interval);
    }

    private refreshData() {
        console.log('[TermineViewComponent] refresh data');

        const startDate = new Date();

        this.eventService.getEvents(startDate, 5)
            .then(evts => {
                this.events = evts;
            })
            .catch(error => {
                console.log(error);
                return Promise.reject(error.error);
            });
    }
}
