import { Observable } from "../__init__.js";
import { uuid4 } from "../utils/uuid.js";
export function watch(args, fn) {
    let network;
    const obs = new Observable(uuid4(), fn(), { local: true });
    args.forEach((arg) => {
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
export class Model {
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
