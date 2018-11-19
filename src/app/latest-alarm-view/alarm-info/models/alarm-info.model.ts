import { PlaceOfAction } from './placeOfAction.model';
import { Keywords } from './keywords.model';
import { Resources } from './resource.model';

export interface AlarmInfo {
    readonly time: Date;
    readonly priority: number;
    readonly comment?: string;
    readonly placeOfAction?: PlaceOfAction;
    readonly keywords?: Keywords;
    readonly resources?: Resources[];
    readonly [propName: string]: any;
}
