import { ReceiverFn_t } from "../comm/__init__.js";
import { weakref } from "../utils/__init__.js";
import { get_default } from "../utils/dicttools.js";
import { uuid4 } from "../utils/uuid.js";
import { BaseChangeMessage, OBSERVABLE_CHANGE_MSG } from "./messages.js";
import { ObservableNetwork } from "./observable_network.js";
import { BaseObservableSchema } from "./schema.js";

/**
 * The keywords supported by {@link ObservableBase}
 */
export type ObservableKwds = {
    id?: string;
    remote?: boolean;
    network?: ObservableNetwork;
};

export abstract class ObservableBase<Schema_T extends BaseObservableSchema, Message_T extends BaseChangeMessage> {
    #id: string;
    #remote: boolean;
    #network?: ObservableNetwork;
    #receivers: weakref.IterableWeakMap<ReceiverFn_t, ReceiverFn_t>;
    #is_updating: boolean;

    protected constructor(kwds: ObservableKwds = {}) {
        this.#id = get_default(kwds, "id", uuid4());
        this.#remote = get_default(kwds, "remote", false);
        this.#network = get_default(kwds, "network", undefined);
        this.#receivers = new weakref.IterableWeakMap();
        this.#is_updating = false;
    }

    /**
     * Gets the {@link Observable}'s id
     *
     * @readonly
     */
    get id(): string {
        return this.#id;
    }

    /**
     * Gets the {@link Observable}'s remote property
     *
     * @readonly
     */
    get remote(): boolean {
        return this.#remote;
    }


    /**
     * Gets the {@link Observable}'s {@link ObservableNetwork}
     *
     * @readonly
     */
    get network(): ObservableNetwork | void {
        return this.#network;
    }

    /**
     * Gets the {@link Observable}'s {@link ObservableNetwork}
     *
     * @readonly
     */
    get receivers(): weakref.IterableWeakMap<ReceiverFn_t, ReceiverFn_t> {
        return this.#receivers;
    }

    /**
     * Watches the observable and calls the callback with its value
     * as the argument when changed.
     *
     * @param {TransformFn<T, any>} fn the callback
     * @see {@link Observable.watch}
     */
    watch(fn: (change: Message_T) => any): void {
        const __recv_change = (change: Message_T) => {
            if (change["data_id"] != this.id) { return; }
            fn(change);
        };

        this.receivers.set(fn, __recv_change);
        this.network?.comm.recv(OBSERVABLE_CHANGE_MSG, __recv_change);
    }

    /**
     * Internal method: used by {@link ObservableNetwork} as part of registration
     *
     * @private
     * @param {ObservableNetwork} network
     */
    __register(network: ObservableNetwork): void {
        this.#network = network;
        for (let fn of this.#receivers.values()) {
            this.#network.comm.recv(OBSERVABLE_CHANGE_MSG, fn);
        }
    }


    /**
     * Internal method: used by {@link ObservableNetwork} as part of communication
     *
     * @private
     * @param change
     */
    __recv_change(change: Message_T): void {
        this._handle_change_message(change);
    }

    protected _emit_change_message(change: Message_T, local: boolean = false): void {
        if (this.#is_updating) { return; }

        this.#is_updating = true;

        if (this.remote && !local) {
            this.network?.send_change(change);
        }
        else {
            this.network?.notify_change(change);
        }

        this.#is_updating = false;
    }

    protected abstract _handle_change_message(msg: Message_T): void;
}

