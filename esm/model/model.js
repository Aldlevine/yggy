import { Observable } from "../__init__.js";
import { uuid4 } from "../utils/uuid.js";
export function watch(args, fn) {
    let network;
    const obs = Observable(fn(), { id: uuid4(), remote: false });
    args.forEach((arg) => {
        if (Observable.isObservable(arg)) {
            if (arg.network) {
                network = arg.network;
            }
            arg.watch(() => obs.set(fn()));
        }
    });
    if (network) {
        network.register(obs);
    }
    return obs;
}
// export type ModelProxy<T extends Model> = T & {
//     [P in keyof T]:
//     T[P] extends Observable<infer V> ?
//     Observable<V> & ObservableProxy<V> :
//     T[P]
// }
export class Model {
    constructor() { }
    // static from_schema<T extends Model>(schema: ModelSchema): ModelProxy<T> {
    static from_schema(schema) {
        const result = new Model();
        for (let key in schema) {
            const item = schema[key];
            const obs_item = item;
            if (typeof obs_item["data_id"] === "string") {
                const obs = Observable.from_schema(obs_item);
                Object.defineProperty(result, key, {
                    value: obs,
                    configurable: false,
                    enumerable: true,
                    writable: false,
                });
                continue;
            }
            const model_item = item;
            if (typeof model_item["model_id"] === "string") {
                const model = Model.from_schema(model_item);
                Object.defineProperty(result, key, {
                    value: model,
                    configurable: false,
                    enumerable: true,
                    writable: false,
                });
                continue;
            }
        }
        // return <ModelProxy<T>>result;
        return result;
    }
    *observables() {
        for (let key in this) {
            const item = this[key];
            if (item instanceof Observable) {
                yield item;
                continue;
            }
            if (item instanceof Model) {
                yield* item.observables();
            }
        }
    }
}
