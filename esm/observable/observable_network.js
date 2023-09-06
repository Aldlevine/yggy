import { OBSERVABLE_CHANGE_MSG, OBSERVABLE_CLIENT_CHANGE_MSG, } from "./messages.js";
export class ObservableNetwork {
    #registry;
    #updating;
    #comm;
    constructor(comm) {
        this.#registry = {};
        this.#updating = new Set();
        this.#comm = comm;
        this.#comm.recv(OBSERVABLE_CHANGE_MSG, this.#recv_change.bind(this));
    }
    get comm() {
        return this.#comm;
    }
    get(id) {
        return this.#registry[id];
    }
    send_change(change) {
        if (this.#updating.has(change.data_id)) {
            return;
        }
        this.#comm.send(OBSERVABLE_CLIENT_CHANGE_MSG, change);
    }
    notify_change(change) {
        this.#comm.notify(OBSERVABLE_CHANGE_MSG, change);
    }
    register(obs) {
        this.#registry[obs.id] = obs;
        obs.__register(this);
    }
    #recv_change(change) {
        const { data_id } = change;
        if (this.#updating.has(data_id)) {
            return;
        }
        this.#updating.add(data_id);
        this.#registry[data_id].__recv_change(change);
        this.#updating.delete(data_id);
    }
}
