import { OBSERVABLE_CHANGE_MSG, OBSERVABLE_CLIENT_CHANGE_MSG } from "./messages.js";
export class ObservableNetwork {
    #registry;
    #comm;
    constructor(comm) {
        this.#registry = {};
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
        this.#comm.send(OBSERVABLE_CLIENT_CHANGE_MSG, change);
    }
    notify_change(change) {
        this.#comm.notify(OBSERVABLE_CHANGE_MSG, change);
    }
    emit_change(change) {
        this.#comm.emit(OBSERVABLE_CHANGE_MSG, change);
    }
    register(obs) {
        this.#registry[obs.id] = obs;
        obs.__register(this);
    }
    #recv_change(change) {
        const { data_id } = change;
        this.#registry[data_id].__recv_change(change);
    }
}
