import { weakref } from "../utils/__init__.js";
import { get_default } from "../utils/dicttools.js";
import { uuid4 } from "../utils/uuid.js";
import { OBSERVABLE_CHANGE_MSG } from "./messages.js";
export class ObservableBase {
    #id;
    #remote;
    #network;
    #receivers;
    #is_updating;
    constructor(kwds = {}) {
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
    get id() {
        return this.#id;
    }
    /**
     * Gets the {@link Observable}'s remote property
     *
     * @readonly
     */
    get remote() {
        return this.#remote;
    }
    /**
     * Gets the {@link Observable}'s {@link ObservableNetwork}
     *
     * @readonly
     */
    get network() {
        return this.#network;
    }
    /**
     * Gets the {@link Observable}'s {@link ObservableNetwork}
     *
     * @readonly
     */
    get receivers() {
        return this.#receivers;
    }
    /**
     * Watches the observable and calls the callback with its value
     * as the argument when changed.
     *
     * @param {TransformFn<T, any>} fn the callback
     * @see {@link Observable.watch}
     */
    watch(fn) {
        const __recv_change = (change) => {
            if (change["data_id"] != this.id) {
                return;
            }
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
    __register(network) {
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
    __recv_change(change) {
        this._handle_change_message(change);
    }
    _emit_change_message(change, local = false) {
        if (this.#is_updating) {
            return;
        }
        this.#is_updating = true;
        if (this.remote && !local) {
            this.network?.send_change(change);
        }
        else {
            this.network?.notify_change(change);
        }
        this.#is_updating = false;
    }
}
