import { watch } from "../__init__.js";
import { ReceiverFn_t, create_message } from "../comm/__init__.js";
import { weakref } from "../utils/__init__.js";
import { ChangeMessage, OBSERVABLE_CHANGE_MSG } from "./messages.js";
import { ObservableNetwork } from "./observable_network.js";
import { ObservableSchema } from "./schema.js";

export type ObservableOr<T> =
    T extends { [key: string]: any }
    ? {
        [P in keyof T]:
        Observable<Exclude<T[P], undefined>> |
        Exclude<T[P], undefined>;
    }
    : (Observable<T> | T);

type ObservableKwds = {
    local?: boolean;
}

export type ObservableProxy<T> = {
    [P in keyof T]:
    T[P] extends (..._: infer A) => infer R
    ? (..._: A) => Observable<R> & ObservableProxy<R>
    : never
};


export function get<T>(obs: Observable<T> | T): T {
    if (obs instanceof Observable) {
        return obs.get();
    }
    return obs;
}

class ObservableProxyHandler<T extends Observable<any>> implements ProxyHandler<T> {
    get(target: T, p: string | symbol, receiver: any) {
        {
            const value = target.get();
            const attr = value && value[p as keyof T];
            if (attr) {
                if (typeof attr === "function") {
                    return (...args: any[]) => watch([target], () => {
                        return attr.call(target.get(), ...args);
                    });
                }
            }
        }

        {
            const attr = target[p as keyof T];
            if (typeof attr === "function") {
                return (...args: any[]) => attr.call(target, ...args);
            }
            return attr;
        }

    }
}

export class Observable<T> {
    #network?: ObservableNetwork;
    #id: string;
    #value: T;
    #receivers: weakref.IterableWeakMap<ReceiverFn_t, ReceiverFn_t>;
    #local: boolean;

    private constructor(__id: string, __value: T, __kwds: ObservableKwds = {}) {
        this.#id = __id;
        this.#value = __value;
        this.#receivers = new weakref.IterableWeakMap();
        this.#local = __kwds.local ?? false;
    }

    static create<U>(__id: string, __value: U, __kwds: ObservableKwds = {}): Observable<U> & ObservableProxy<U> {
        const obs = new Observable(__id, __value, __kwds);
        return this.create_proxy(obs);
    }

    static create_proxy<U>(obs: Observable<U>): Observable<U> & ObservableProxy<U> {
        return <Observable<U> & ObservableProxy<U>>new Proxy(obs, new ObservableProxyHandler());
    }

    get id(): string {
        return this.#id;
    }

    get network(): ObservableNetwork | void {
        return this.#network;
    }

    static from_schema<T>(__schema: ObservableSchema<T>): Observable<T> & ObservableProxy<T> {
        return this.create(__schema.data_id, __schema.value);
    }

    register(__network: ObservableNetwork): void {
        this.#network = __network;
        for (let fn of this.#receivers.values()) {
            this.#network.comm.recv(OBSERVABLE_CHANGE_MSG, fn);
        }
    }

    get(): T {
        return this.#value;
    }

    set(__value: T): void {
        this.#value = __value;

        this.#notify_change();
    }


    watch(__fn: ReceiverFn_t): void {
        const __recv_change = (__change: ChangeMessage<any>) => {
            if (__change["data_id"] != this.id) { return; }
            __fn(__change);
        };

        this.#receivers.set(__fn, __recv_change);
        this.#network?.comm.recv(OBSERVABLE_CHANGE_MSG, __recv_change);
    }

    #notify_change(): void {
        const change = create_message<ChangeMessage<T>>({
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

    __recv_change(change: ChangeMessage<T>): void {
        this.set(change.new_value);
    }
}
