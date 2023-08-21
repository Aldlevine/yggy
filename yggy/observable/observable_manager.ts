import { Comm } from "../comm/comm.js";
import { __uuid4 } from "../utils.js";
import {
    ChangeMessage,
    OBSERVABLE_CHANGE_MSG,
    OBSERVABLE_CLIENT_CHANGE_MSG,
    OBSERVABLE_REGISTER_MSG,
    RegisterMessage,
    RegisterObjectMessage,
    RegisterValueMessage,
} from "./messages.js";
import { Observable } from "./observable.js";
import { ObservableObject } from "./observable_object.js";
import { ObservableValue } from "./observable_value.js";

export class ObservableManager {
    private __registry: { [key: string]: Observable };
    private __updating: Set<string>;
    private __comm: Comm;

    constructor(__comm: Comm) {
        this.__registry = {};
        this.__updating = new Set();
        this.__comm = __comm;

        this.__comm.recv(OBSERVABLE_CHANGE_MSG, this.__recv_change.bind(this));
        this.__comm.recv(
            OBSERVABLE_REGISTER_MSG,
            this.__recv_register.bind(this)
        );
    }

    public get comm(): Comm {
        return this.__comm;
    }

    public get(__id: string | number): Observable | undefined {
        if (typeof __id === "number") {
            return Object.values(this.__registry)[__id];
        }
        return this.__registry[__id];
    }

    public notify_change(__change: ChangeMessage<any>): void {
        if (this.__updating.has(__change.data_id)) {
            return;
        }

        this.__comm.send(OBSERVABLE_CLIENT_CHANGE_MSG, __change);
    }

    private __recv_change(__change: ChangeMessage<any>): void {
        const { data_id } = __change;

        if (this.__updating.has(data_id)) {
            return;
        }
        this.__updating.add(data_id);

        this.__registry[data_id]._recv_change(__change);

        this.__updating.delete(data_id);
    }

    private __recv_register(__observable: RegisterMessage): void {
        if (__observable.observable_type == "value") {
            const { data_id, value } = <RegisterValueMessage<any>>__observable;
            this.__registry[data_id] = new ObservableValue(this, data_id, value);
        }

        if (__observable.observable_type == "object") {
            const { data_id, attrs } = <RegisterObjectMessage>__observable;
            this.__registry[data_id] = new ObservableObject(this, data_id, attrs);
        }
    }

}
