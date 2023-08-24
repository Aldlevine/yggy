import { ReceiverFn_t, create_message } from "../comm/__init__.js";
import { IterableWeakMap } from "../utils.js";
import { ChangeMessage, OBSERVABLE_CHANGE_MSG } from "./messages.js";
import { ObservableNetwork } from "./observable_network.js";
import { ObservableSchema } from "./schema.js";

export class Observable<T> {
    #network?: ObservableNetwork;
    #id: string;
    #value: T;
    #receivers: IterableWeakMap<ReceiverFn_t, ReceiverFn_t>;

    constructor(__id: string, __value: T) {
        this.#id = __id;
        this.#value = __value;
        this.#receivers = new IterableWeakMap();
    }

    get id(): string {
        return this.#id;
    }

    static from_schema<T>(__schema: ObservableSchema<T>): Observable<T> {
        return new Observable(__schema.data_id, __schema.value);
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
        const old_value = this.#value;
        this.#value = __value;

        this.#notify_change(old_value, __value);
    }


    watch(__fn: ReceiverFn_t): void {
        const __recv_change = (__change: ChangeMessage<any>) => {
            if (__change["data_id"] != this.id) { return; }
            __fn(__change);
        };

        this.#receivers.set(__fn, __recv_change);
        this.#network?.comm.recv(OBSERVABLE_CHANGE_MSG, __recv_change);
    }

    #notify_change<T>(old_value: T, new_value: T): void {
        const change = create_message<ChangeMessage<T>>({
            data_id: this.id,
            new_value: new_value,
            old_value: old_value,
        });

        this.#network?.notify_change(change);
    }

    __recv_change(change: ChangeMessage<T>): void {
        this.set(change.new_value);
    }
}
