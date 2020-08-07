import { cc } from "./Utils";

export class Entity {
    position: IPosition = cc.v2(0, 0);
    hp: number = 0;
    attack: number = 0;
}