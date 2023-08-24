import { Observable, ObservableSchema } from "../__init__.js";
import { ModelSchema } from "./schema.js";

export class Model {

    static from_schema<T = never>(schema: ModelSchema): Model & T {
        const result = <Model & T>new Model();

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

        return result;
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