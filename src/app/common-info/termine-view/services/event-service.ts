import { environment } from './../../../../environments/environment';
import { EventItem } from './../event-item';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { AppConfig } from '../../../services/app-config.service';


/**
 * Queries events form google calendar.
 *
 * @export
 * @class EventService
 */
@Injectable()
export class EventService {

    private _endpoint = 'https://www.googleapis.com/calendar/v3/calendars/';
    private _calendarId = encodeURIComponent(AppConfig.settings.googleCalendarId);
    private _apiKey = AppConfig.settings.googleMapsKey;

    constructor(private httpClient: HttpClient) {}

    public getEvents(startDate: Date, maxResults: number): Promise<EventItem[]> {
        // clear time and behold the date
        // tslint:disable-next-line:max-line-length
        const todayAtMidn = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate(), 0, -1 * startDate.getTimezoneOffset(), 0);
        const timeMin = encodeURIComponent(todayAtMidn.toISOString());

        // tslint:disable-next-line:max-line-length
        const options = `?maxResults=${maxResults}&orderBy=startTime&showDeleted=false&showHiddenInvitations=false&singleEvents=true&timeMin=${timeMin}&key=${this._apiKey}`;
        const url = `${this._endpoint}${this._calendarId}/events${options}`;

        const promise = new Promise<EventItem[]>((resolve, reject) => {
            this.httpClient.get<EventItem[]>(url)
                        .pipe(map(this.mapItems))
                        .toPromise()
                        .then(data => {
                            resolve(data);
                            })
                        .catch(error => {
                            console.log(error);
                            return Promise.reject(error.error);
                        });
        });

        return promise;
    }

    private mapItems(value: any, index: number): EventItem[] {
        const items: EventItem[] = [];

        value['items'].forEach(element => {

            let description: string = element['description'];
            if (description) {
                description = description.replace('\n', '<br />');
            }

            items.push({
                title: element['summary'],
                description: description,
                date: element['start']['dateTime'],
                location: element['location']
            });
        });

        return items;
    }
}
