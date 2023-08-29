import { ObservableSchema } from "../observable/__init__.js";
export type ModelSchema = {
    model_id: string;
} & {
    [key: string]: ObservableSchema<any> | ModelSchema;
};
