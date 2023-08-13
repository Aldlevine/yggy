import { Comm } from "../comm/comm.js"
import { Observable } from "./observable.js";

// TODO: constants should be transpiled from py
export const OBSERVABLE_CHANGE_MSG = "observable.change";
export const OBSERVABLE_CLIENT_CHANGE_MSG = "observable.client_change";
export const OBSERVABLE_READY_MSG = "observable.ready";
export const OBSERVABLE_REGISTER_MSG = "observable.register";

// TODO: pod types should be transpiled from py
export type ObservableChange<T> = {
    event_id: string;
    data_id: string;
    old_value: T;
    new_value: T;
}

// TODO: pod types should be transpiled from py
export type ObservableRegister<T> = {
    id: string;
    value: T;
}

export class ObservableManager {
    private __registry: { [key: string]: Observable<any> };
    private __updating: Set<string>;
    private __comm: Comm;

    constructor(__comm: Comm) {
        this.__registry = {};
        this.__updating = new Set();
        this.__comm = __comm;

        this.__comm.recv(OBSERVABLE_CHANGE_MSG, this.__recv_change.bind(this));
        this.__comm.recv(OBSERVABLE_REGISTER_MSG, this.__recv_register.bind(this));
    }

    public get<T = any>(__id: string | number): Observable<T> | undefined {
        if (typeof __id === "number") {
            return Object.values(this.__registry)[__id];
        }
        return this.__registry[__id];
    }

    public notify_change(__change: ObservableChange<any>): void {
        if (this.__updating.has(__change.data_id)) { return; }

        this.__comm.send(OBSERVABLE_CLIENT_CHANGE_MSG, __change);
    }

    private __recv_change(__change: ObservableChange<any>): void {
        const { data_id, new_value } = __change;

        if (this.__updating.has(data_id)) { return; }
        this.__updating.add(data_id);

        this.__registry[data_id].set(new_value);

        this.__updating.delete(data_id);
    }

    private __recv_register(__observable: ObservableRegister<any>): void {
        const { id, value } = __observable;

        this.__registry[id] = new Observable(this, id, value);
    }

}