import { Kuenstler } from "./kuenstler.entity";
import { Lied } from "./lied.entity";

export class Album {
    readonly kuenstler: Kuenstler | undefined;

    readonly lieder: Lied[] | undefined;
}
