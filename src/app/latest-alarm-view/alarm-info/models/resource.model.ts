import { Equipment } from './equipment.model';

export interface Resources {
    readonly name: string;
    readonly equipments?: Equipment[];
}
