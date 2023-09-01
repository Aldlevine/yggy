import { watch } from "../__init__.js";
import { create_message } from "../comm/__init__.js";
import { weakref } from "../utils/__init__.js";
import { OBSERVABLE_CHANGE_MSG } from "./messages.js";
export function get(obs) {
    if (obs instanceof Observable) {
        return obs.get();
    }
    return obs;
}
class ObservableProxyHandler {
    get(target, p, receiver) {
        {
            const value = target.get();
            const attr = value && value[p];
            if (attr) {
                if (typeof attr === "function") {
                    return (...args) => watch([target], () => {
                        return attr.call(target.get(), ...args);
                    });
                }
            }
        }
        {
            const attr = target[p];
            if (typeof attr === "function") {
                return (...args) => attr.call(target, ...args);
            }
            return attr;
        }
    }
}
export class Observable {
    #network;
    #id;
    #value;
    #receivers;
    #local;
    constructor(__id, __value, __kwds = {}) {
        this.#id = __id;
        this.#value = __value;
        this.#receivers = new weakref.IterableWeakMap();
        this.#local = __kwds.local ?? false;
    }
    static create(__id, __value, __kwds = {}) {
        const obs = new Observable(__id, __value, __kwds);
        return this.create_proxy(obs);
    }
    static create_proxy(obs) {
        return new Proxy(obs, new ObservableProxyHandler());
    }
    get id() {
        return this.#id;
    }
    get network() {
        return this.#network;
    }
    static from_schema(__schema) {
        return this.create(__schema.data_id, __schema.value);
    }
    register(__network) {
        this.#network = __network;
        for (let fn of this.#receivers.values()) {
            this.#network.comm.recv(OBSERVABLE_CHANGE_MSG, fn);
        }
    }
    get() {
        return this.#value;
    }
    set(__value) {
        this.#value = __value;
        this.#notify_change();
    }
    watch(__fn) {
        const __recv_change = (__change) => {
            if (__change["data_id"] != this.id) {
                return;
            }
            __fn(__change);
        };
        this.#receivers.set(__fn, __recv_change);
        this.#network?.comm.recv(OBSERVABLE_CHANGE_MSG, __recv_change);
    }
    #notify_change() {
        const change = create_message({
            data_id: this.#id,
            new_value: this.#value,
        });
        if (this.#local) {
            this.#network?.notify_change(change);
        }
        else {
            this.#network?.send_change(change);
        }
    }
    __recv_change(change) {
        this.set(change.new_value);
    }
}
