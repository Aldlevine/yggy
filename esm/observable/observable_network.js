import { OBSERVABLE_CHANGE_MSG, OBSERVABLE_CLIENT_CHANGE_MSG, } from "./messages.js";
export class ObservableNetwork {
    #registry;
    #updating;
    #comm;
    constructor(__comm) {
        this.#registry = {};
        this.#updating = new Set();
        this.#comm = __comm;
        this.#comm.recv(OBSERVABLE_CHANGE_MSG, this.#recv_change.bind(this));
    }
    get comm() {
        return this.#comm;
    }
    get(__id) {
        return this.#registry[__id];
    }
    send_change(__change) {
        if (this.#updating.has(__change.data_id)) {
            return;
        }
        this.#comm.send(OBSERVABLE_CLIENT_CHANGE_MSG, __change);
    }
    notify_change(__change) {
        this.#comm.notify(OBSERVABLE_CHANGE_MSG, __change);
    }
    register(__obs) {
        this.#registry[__obs.id] = __obs;
        __obs.__register(this);
    }
    #recv_change(__change) {
        const { data_id } = __change;
        if (this.#updating.has(data_id)) {
            return;
        }
        this.#updating.add(data_id);
        this.#registry[data_id].__recv_change(__change);
        this.#updating.delete(data_id);
    }
}
