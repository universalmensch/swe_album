import { Künstler } from "./künstler.entity";
import { Lied } from "./lied.entity";

export class Album {
    readonly künstler: Künstler | undefined;

    readonly lieder: Lied[] | undefined;
}
