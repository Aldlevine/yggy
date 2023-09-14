import { Observable } from "../__init__.js";
import { ObservableBase } from "../observable/observable_base.js";
import { ObservableList } from "../observable/observable_list.js";
import { uuid4 } from "../utils/uuid.js";
export function watch(args, fn) {
    let network;
    const obs = Observable(fn(), { id: uuid4(), remote: false });
    args.forEach((arg) => {
        if (Observable.is_observable(arg)) {
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
export class Model {
    constructor() { }
    static from_schema(schema) {
        const result = new Model();
        for (let key in schema) {
            const item = schema[key];
            // const obs_item = <ObservableSchema<any>>item;
            const base_obs_item = item;
            if (typeof base_obs_item["data_id"] === "string") {
                const obs_item = item;
                if ("value" in obs_item) {
                    const obs = Observable.from_schema(obs_item);
                    Object.defineProperty(result, key, {
                        value: obs,
                        configurable: false,
                        enumerable: true,
                        writable: false,
                    });
                    continue;
                }
                const obs_list_item = item;
                if ("list" in obs_list_item) {
                    // const obs_list = ObservableList.create(obs_list_item.list);
                    const obs_list = ObservableList.from_schema(obs_list_item);
                    Object.defineProperty(result, key, {
                        value: obs_list,
                        configurable: false,
                        enumerable: true,
                        writable: false,
                    });
                    continue;
                }
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
        return result;
    }
    *observables() {
        for (let key in this) {
            const item = this[key];
            if (item instanceof ObservableBase) {
                yield item;
                continue;
            }
            // if (item instanceof Observable) {
            //     yield <Observable<any>>item;
            //     continue
            // }
            if (item instanceof Model) {
                yield* item.observables();
            }
        }
    }
}
