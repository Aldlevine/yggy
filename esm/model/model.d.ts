import { Observable as Observable } from "../__init__.js";
import { ModelSchema } from "./schema.js";
export declare function watch<T>(args: any[], fn: () => T): Observable<T>;
export declare class Model {
    private constructor();
    static from_schema<T extends Model>(schema: ModelSchema): T;
    observables(): Generator<Observable<any>>;
}
