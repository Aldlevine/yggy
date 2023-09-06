import { Observable, ObservableNetwork, ObservableSchema, Primitive } from "../__init__.js";
import { uuid4 } from "../utils/uuid.js";
import { ModelSchema } from "./schema.js";

export function watch<T extends Primitive>(args: any[], fn: () => T): Observable<T> {
    let network: ObservableNetwork | undefined;
    const obs = Observable(fn(), { id: uuid4(), remote: false });
    args.forEach((arg: any) => {
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
    private constructor() { }

    // static from_schema<T extends Model>(schema: ModelSchema): ModelProxy<T> {
    static from_schema<T extends Model>(schema: ModelSchema): T {
        const result = <T>new Model();

        for (let key in schema) {
            const item = schema[key];

            const obs_item = <ObservableSchema<any>>item;
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

            const model_item = <ModelSchema>item;
            if (typeof model_item["model_id"] === "string") {
                const model = Model.from_schema(model_item);
                Object.defineProperty(result, key, {
                    value: model,
                    configurable: false,
                    enumerable: true,
                    writable: false,
                });
                continue
            }
        }

        // return <ModelProxy<T>>result;
        return result;
    }

    *observables(): Generator<Observable<any>> {
        for (let key in this) {
            const item = this[key];

            if (item instanceof Observable) {
                yield <Observable<any>>item;
                continue
            }

            if (item instanceof Model) {
                yield* item.observables();
            }
        }
    }
}