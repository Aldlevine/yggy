export type BaseObservableSchema = {
    data_id: string;
};
export type ObservableSchema<T> = BaseObservableSchema & {
    value: T;
};
export type ObservableListSchema<T> = BaseObservableSchema & {
    list: T[];
};
