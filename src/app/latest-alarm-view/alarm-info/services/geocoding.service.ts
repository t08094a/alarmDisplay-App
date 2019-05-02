import { GeoPosition } from './../models/geoPosition.model';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/';
import { HttpClient } from '@angular/common/http';
import { AppConfig } from '../../../services/app-config.service';

@Injectable({providedIn: 'root'})
export class GeoCodingService {
    constructor(private http: HttpClient) {
    }

    getLatLng(address: string): Observable<GeoPosition | null> {
        console.log('[GeoCodingService] Getting LatLng for address: ', address);

        const addressPrepared = address.replace(' ', '+');

        return new Observable<GeoPosition>(observer => {
            // tslint:disable-next-line:max-line-length
            const googleGeocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${addressPrepared}&key=${AppConfig.settings.googleMapsKey}`;
            this.http.get(googleGeocodingUrl).subscribe(data => {

                console.log('[GeoCodingService] received location data: ', data);

                if (data['status'] === 'OK') {

                    const results = data['results'];
                    const location = results[0].geometry.location;

                    console.log(`[GeoCodingService] received location: ${location.lat}, ${location.lng}`);

                    const geoposition = {
                        x: '',
                        y: '',
                        lat: location.lat,
                        lng: location.lng
                    }

                    observer.next(geoposition);
                    observer.complete();
                } else {
                    console.log('[GeoCodingService] Error: ', data['results'], ' & Status: ', data['status']);

                    observer.next(null);
                    observer.complete();
                }
            },
            error => {
                console.log('[GeoCodingService] Error: ', error, ' & Status: ', status);

                observer.next(null);
                observer.complete();
            });
        });
    }
}
