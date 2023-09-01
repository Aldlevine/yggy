import { Observable, ObservableNetwork, ObservableProxy, ObservableSchema } from "../__init__.js";
import { uuid4 } from "../utils/uuid.js";
import { ModelSchema } from "./schema.js";

export function watch<T>(args: any[], fn: () => T): Observable<T> & ObservableProxy<T> {
    let network!: ObservableNetwork;
    const obs = Observable.create(uuid4(), fn(), { local: true });
    args.forEach((arg: any) => {
        if (arg instanceof Observable) {
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

export type ProxiedModel<T extends Model> = T & {
    [P in keyof T]:
    T[P] extends Observable<infer V> ?
    Observable<V> & ObservableProxy<V> :
    T[P]
}

export class Model {

    // static from_schema<T extends Model>(schema: ModelSchema): T {
    static from_schema<T extends Model>(schema: ModelSchema): ProxiedModel<T> {
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

        return <ProxiedModel<T>>result;
    }

    *observables(): Generator<Observable<any>> {
        for (let key in this) {
            const item = this[key];

            if (item instanceof Observable) {
                yield item;
                continue
            }

            if (item instanceof Model) {
                yield* item.observables();
            }
        }
    }
}
