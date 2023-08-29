import { Message } from "../comm/__init__.js";
export declare const OBSERVABLE_CHANGE_MSG = "observable.change";
export declare const OBSERVABLE_CLIENT_CHANGE_MSG = "observable.client_change";
export declare const OBSERVABLE_REGISTER_MSG = "observable.register";
export type ChangeMessage<T> = Message & {
    data_id: string;
    new_value: T;
};
export type ClientChangeMessage<T> = ChangeMessage<T> & {};
export type RegisterMessage<T> = Message & {
    data_id: string;
    value: T;
};
