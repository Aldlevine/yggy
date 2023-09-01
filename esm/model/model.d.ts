import { Observable, ObservableProxy } from "../__init__.js";
import { ModelSchema } from "./schema.js";
export declare function watch<T>(args: any[], fn: () => T): Observable<T> & ObservableProxy<T>;
export type ProxiedModel<T extends Model> = T & {
    [P in keyof T]: T[P] extends Observable<infer V> ? Observable<V> & ObservableProxy<V> : T[P];
};
export declare class Model {
    static from_schema<T extends Model>(schema: ModelSchema): ProxiedModel<T>;
    observables(): Generator<Observable<any>>;
}
