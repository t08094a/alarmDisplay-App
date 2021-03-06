import { GeoPosition } from './geoPosition.model';

export interface PlaceOfAction {
    readonly street?: string;
    readonly houseNumber?: string;
    readonly city?: string;
    readonly addition?: string;
    geoPosition: GeoPosition | null;
    adressAsCombinedString?: string;
}
