import { Observable, Primitive } from "../__init__.js";
import { ObservableBase } from "../observable/observable_base.js";
import { ModelSchema } from "./schema.js";
export declare function watch<T extends Primitive>(args: any[], fn: () => T): Observable<T>;
export declare class Model {
    private constructor();
    static from_schema<T extends Model>(schema: ModelSchema): T;
    observables(): Generator<ObservableBase<any, any>>;
}
