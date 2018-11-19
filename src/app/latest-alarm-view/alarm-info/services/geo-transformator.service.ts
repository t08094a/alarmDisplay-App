import { Injectable } from '@angular/core';
/**
 * Transformation Service to transform coordinates of Gauß Krüger to WGS84.
 *
 * https://github.com/mikelortega/GeoUtility/blob/master/GeoSystem/GaussKrueger.cs
 *
 * Copyight (c) 2009-2015 Steffen Habermehl
 * geoutility@freenet.de
 *
 * GNU GENERAL PUBLIC LICENSE Ver. 3, GPLv3
 * @export
 * @class GeoTransformatorService
 */
@Injectable({
    providedIn: 'root'
})
export class GeoTransformatorService {
    // Große Halbachse und Abplattung BESSEL
    private readonly HALBACHSE = 6377397.155;
    private readonly ABPLATTUNG = 3.342773182E-03;

    // Polkrümmung
    private readonly POL = this.HALBACHSE / (1 - this.ABPLATTUNG);

    // Num. Exzentrizitäten
    private readonly EXZENT = ((2 * this.ABPLATTUNG) - (this.ABPLATTUNG * this.ABPLATTUNG));
    // tslint:disable-next-line:max-line-length
    private readonly EXZENT2 = ((2 * this.ABPLATTUNG) - (this.ABPLATTUNG * this.ABPLATTUNG)) / ((1 - this.ABPLATTUNG) * (1 - this.ABPLATTUNG));
    private readonly EXZENT4 = this.EXZENT2 * this.EXZENT2;
    private readonly EXZENT6 = this.EXZENT4 * this.EXZENT2;
    private readonly EXZENT8 = this.EXZENT4 * this.EXZENT4;

    // Geographische Grenzen des Gauss-Krüger-Systems in Grad
    private readonly MIN_OST = 5.0;
    private readonly MAX_OST = 16.0;
    private readonly MIN_NORD = 46.0;
    private readonly MAX_NORD = 56.0;

    // Parameter für Datumsverschiebung Potsdam - WGS84 (entgegengesetzte Verschiebung dann negative Werte)
    private readonly POTSDAM_DATUM_SHIFT_X = 587;
    private readonly POTSDAM_DATUM_SHIFT_Y = 16;
    private readonly POTSDAM_DATUM_SHIFT_Z = 393;

    // Abplattung WGS84 = 298,257223563 (1/x)
    private readonly WGS84_ABPLATTUNG = 3.35281066474748E-03;

    // Num. Exzentrizitäten
    private readonly WGS84_EXZENT = ((2 * this.WGS84_ABPLATTUNG) - (this.WGS84_ABPLATTUNG * this.WGS84_ABPLATTUNG));

    constructor() {}

    public transformGaussKruegerToWsg84(east: string, north: string): Position {
        const gk = {lat: Number(east), lng: Number(north)};

        const potsdam = this.transformGaussKruegerToLatLngPotsdam(gk);
        const wgs84 = this.transformPotsdamFormatToWgs84(potsdam);

        console.log(`transformed {→ ${east}; ↑ ${north} } => { → ${wgs84.lng}; ↑ ${wgs84.lat} }`);

        return wgs84;
    }

    private transformGaussKruegerToLatLngPotsdam(gk: Position): Position {
        const rechts: number = gk.lat;
        const hoch: number = gk.lng;

        // Koeffizienten für Länge Meridianbogen
        // tslint:disable-next-line:max-line-length
        const koeff0 = this.POL * (Math.PI / 180) * (1 - 3 * this.EXZENT2 / 4 + 45 * this.EXZENT4 / 64 - 175 * this.EXZENT6 / 256 + 11025 * this.EXZENT8 / 16384);
        // tslint:disable-next-line:max-line-length
        const koeff2 = (180 / Math.PI) * (3 * this.EXZENT2 / 8 - 3 * this.EXZENT4 / 16 + 213 * this.EXZENT6 / 2048 - 255 * this.EXZENT8 / 4096);
        const koeff4 = (180 / Math.PI) * (21 * this.EXZENT4 / 256 - 21 * this.EXZENT6 / 256 + 533 * this.EXZENT8 / 8192);
        const koeff6 = (180 / Math.PI) * (151 * this.EXZENT6 / 6144 - 453 * this.EXZENT8 / 12288);

        // Geogr. Breite (Rad)
        const sig = hoch / koeff0;
        const sigRad = sig * Math.PI / 180;
        const fbreite = sig + koeff2 * Math.sin(2 * sigRad) + koeff4 * Math.sin(4 * sigRad) + koeff6 * Math.sin(6 * sigRad);
        const breiteRad = fbreite * Math.PI / 180;

        const tangens1 = Math.tan(breiteRad);
        const tangens2 = Math.pow(tangens1, 2);
        const tangens4 = Math.pow(tangens1, 4);
        const cosinus1 = Math.cos(breiteRad);
        const cosinus2 = Math.pow(cosinus1, 2);

        const eta = this.EXZENT2 * cosinus2;

        // Querkrümmung
        const qkhm1 = this.POL / Math.sqrt(1 + eta);
        const qkhm2 = Math.pow(qkhm1, 2);
        const qkhm3 = Math.pow(qkhm1, 3);
        const qkhm4 = Math.pow(qkhm1, 4);
        const qkhm5 = Math.pow(qkhm1, 5);
        const qkhm6 = Math.pow(qkhm1, 6);

        // Differenz zum Bezugsmeridian
        const kfakt = Math.trunc(rechts / 1E+06);
        const merid = kfakt * 3;
        const dlaenge1 = rechts - (kfakt * 1E+06 + 500000);
        const dlaenge2 = Math.pow(dlaenge1, 2);
        const dlaenge3 = Math.pow(dlaenge1, 3);
        const dlaenge4 = Math.pow(dlaenge1, 4);
        const dlaenge5 = Math.pow(dlaenge1, 5);
        const dlaenge6 = Math.pow(dlaenge1, 6);

        // Faktor für Berechnung Breite
        const bfakt2 = -tangens1 * (1 + eta) / (2 * qkhm2);
        const bfakt4 = tangens1 * (5 + 3 * tangens2 + 6 * eta * (1 - tangens2)) / (24 * qkhm4);
        const bfakt6 = -tangens1 * (61 + 90 * tangens2 + 45 * tangens4) / (720 * qkhm6);

        // Faktor für Berechnung Länge
        const lfakt1 = 1 / (qkhm1 * cosinus1);
        const lfakt3 = -(1 + 2 * tangens2 + eta) / (6 * qkhm3 * cosinus1);
        const lfakt5 = (5 + 28 * tangens2 + 24 * tangens4) / (120 * qkhm5 * cosinus1);

        // Geographische Länge und Breite Potsdam
        const geoBreite = fbreite + (180 / Math.PI) * (bfakt2 * dlaenge2 + bfakt4 * dlaenge4 + bfakt6 * dlaenge6);
        const geoLaenge = merid + (180 / Math.PI) * (lfakt1 * dlaenge1 + lfakt3 * dlaenge3 + lfakt5 * dlaenge5);

        if (geoLaenge < this.MIN_OST || geoLaenge > this.MAX_OST ||
            geoBreite < this.MIN_NORD || geoBreite > this.MAX_NORD) {
            throw new RangeError(`the geo position is out of bounce. latitude: ${geoBreite}; longitude: ${geoLaenge}`);
        }

        return {lat: geoBreite, lng: geoLaenge};
    }

    private transformPotsdamFormatToWgs84(positionPotsdam: Position): Position {
        // Breite und Länge (Rad)
        const breiteRad = positionPotsdam.lat * (Math.PI / 180);
        const laengeRad = positionPotsdam.lng * (Math.PI / 180);

        // Querkrümmung
        const qkhm = this.HALBACHSE / Math.sqrt(1 - this.EXZENT * Math.sin(breiteRad) * Math.sin(breiteRad));

        // Kartesische Koordinaten Potsdam
        const xPotsdam = qkhm * Math.cos(breiteRad) * Math.cos(laengeRad);
        const yPotsdam = qkhm * Math.cos(breiteRad) * Math.sin(laengeRad);
        const zPotsdam = (1 - this.EXZENT) * qkhm * Math.sin(breiteRad);

        // Kartesische Koordinaten WGS84
        const x = xPotsdam + this.POTSDAM_DATUM_SHIFT_X;
        const y = yPotsdam + this.POTSDAM_DATUM_SHIFT_Y;
        const z = zPotsdam + this.POTSDAM_DATUM_SHIFT_Z;

        // Breite und Länge im WGS84 Datum
        const b = Math.sqrt(x * x + y * y);
        const breite = (180 / Math.PI) * Math.atan((z / b) / (1 - this.WGS84_EXZENT));

        let laenge = 0;
        if (x > 0) {
            laenge = (180 / Math.PI) * Math.atan(y / x);
        } else if (x < 0 && y > 0) {
            laenge = (180 / Math.PI) * Math.atan(y / x) + 180;
        } else if (x < 0 && y < 0) {
            laenge = (180 / Math.PI) * Math.atan(y / x) - 180;
        }

        return {lat: breite, lng: laenge};
    }
}

interface Position {
    readonly lat: number;
    readonly lng: number;
}
