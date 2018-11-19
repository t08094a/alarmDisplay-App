import { Observable, ReplaySubject } from 'rxjs/';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AbekItem } from '../models/abek-item.model';

@Injectable()
export class AbekService {

    private regexp = new RegExp('#([A-Z]+)([0-9]{2})([0-9]{2})#');
    private dataUrl = '../../../../assets/abek_2016.json';
    private data: Array<AbekItem> = null;

    constructor(private httpClient: HttpClient) {}

    private extractAbekKey(bemerkung: string): ABekKey {
        console.log(`[ABekService] try to extract ABek Key from \"${bemerkung}\"`);

        try {
            const match = this.regexp.exec(bemerkung);

            if (match) {
                const found = match[0];
                const prefix = match[1];
                const hauptgruppe = match[2];
                const untergruppe = match[3];
                const hauptgruppeNr: number = parseInt(hauptgruppe, 10);
                const untergruppeNr: number = parseInt(untergruppe, 10);

                console.log(`[ABekService] extracted ABek Key \"${found}\"`);

                return new ABekKeyImpl(prefix, hauptgruppeNr, untergruppeNr);
            } else {
                console.warn(`[ABekService] unable to extract ABek Key from \"${bemerkung}\", use empty one`);
                return new ABekKeyImpl('', 0, 0);
            }
        } catch {
            console.warn(`[ABekService] unable to extract ABek Key from \"${bemerkung}\", use empty one`);
            return new ABekKeyImpl('', 0, 0);
        }
    }

    private readAllAbekItems(): Promise<AbekItem[]> {
        if (this.data != null) {
            return new Promise(resolve => {
                resolve(this.data);
            });
        }

        return this.httpClient.get<AbekItem[]>(this.dataUrl)
                              .toPromise()
                              .then(data => Promise.resolve(data['data']));
    }

    public getAbekItem(bemerkung: string): Promise<AbekItem> {

        return new Promise(resolve => {
            this.readAllAbekItems().then(result => {
                console.log('[ABekService] AbekItem loaded ...');

                this.data = result;

                const abekKey = this.extractAbekKey(bemerkung);

                if (abekKey.IsEmpty) {
                    console.warn('[ABekService] unable to parse ABekKey');
                    resolve(null);
                    return;
                }

                const found = this.data.find(item => {
                    return item.Prefix === abekKey.Prefix &&
                           item.Hauptgruppe === abekKey.Hauptgruppe &&
                           item.Untergruppe === abekKey.Untergruppe;
                });

                if (found) {
                    console.log('[ABekService] ABek item found:', found);
                    resolve(found);
                } else {
                    console.warn('[ABekService] ABek item not found!');
                    resolve(null);
                }
            });
        });
    }

}

interface ABekKey {
    readonly Prefix: string;
    readonly Hauptgruppe: number;
    readonly Untergruppe: number;
    readonly IsEmpty: boolean;
}

class ABekKeyImpl implements ABekKey {
    Prefix: string;
    Hauptgruppe: number;
    Untergruppe: number;
    IsEmpty = false;

    constructor(prefix: string, hauptgruppe: number, untergruppe: number) {
        this.Prefix = prefix;
        this.Hauptgruppe = hauptgruppe;
        this.Untergruppe = untergruppe;

        if (prefix === '' && hauptgruppe === 0 && untergruppe === 0) {
            this.IsEmpty = true;
        }
    }
}
