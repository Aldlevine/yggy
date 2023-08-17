import { Message } from "../comm/index.js";

export const OBSERVABLE_CHANGE_MSG = "observable.change";
export const OBSERVABLE_CLIENT_CHANGE_MSG = "observable.client_change";
export const OBSERVABLE_READY_MSG = "observable.ready";
export const OBSERVABLE_REGISTER_MSG = "observable.register";

export type ChangeMessage<T> = Message & {
    data_id: string;
    old_value: T;
    new_value: T;
};

export type ClientChangeMessage<T> = ChangeMessage<T> & {};

export type RegisterMessage<T extends "value" | "object"> = Message & {
    observable_type: T;
    data_id: string;
};

export type RegisterValueMessage<T> = RegisterMessage<"value"> & {
    value: T;
};

export type RegisterObjectMessage = RegisterMessage<"object"> & {
    attrs: { [key: string]: string };
};

export type ReadyMessage = Message & {
    client_id: string;
};
