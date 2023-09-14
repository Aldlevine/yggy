import { Message } from "../comm/__init__.js";
export declare const OBSERVABLE_CHANGE_MSG = "observable.change";
export declare const OBSERVABLE_CLIENT_CHANGE_MSG = "observable.client_change";
export declare const OBSERVABLE_REGISTER_MSG = "observable.register";
export type BaseChangeMessage = Message & {
    data_id: string;
};
export type ChangeMessage<T> = BaseChangeMessage & {
    new_value: T;
};
export type ClientChangeMessage<T> = ChangeMessage<T> & {};
export type ListChangeMessage<T> = BaseChangeMessage & {
    inserts: {
        [index: number]: T;
    };
    removes: number[];
};
export type ListClientChangeMessage<T> = ListChangeMessage<T> & {};
export type RegisterMessage<T> = Message & {
    data_id: string;
    value: T;
};
