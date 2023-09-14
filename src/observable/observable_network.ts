import { Comm } from "../comm/comm.js";
import {
    BaseChangeMessage,
    OBSERVABLE_CHANGE_MSG,
    OBSERVABLE_CLIENT_CHANGE_MSG
} from "./messages.js";
import { ObservableBase } from "./observable_base.js";
import { BaseObservableSchema } from "./schema.js";

export class ObservableNetwork {
    #registry: { [key: string]: ObservableBase<any, any> };
    #comm: Comm;

    constructor(comm: Comm) {
        this.#registry = {};
        this.#comm = comm;

        this.#comm.recv(OBSERVABLE_CHANGE_MSG, this.#recv_change.bind(this));
    }

    public get comm(): Comm {
        return this.#comm;
    }

    public get<T extends BaseObservableSchema, U extends BaseChangeMessage>(id: string): ObservableBase<T, U> | undefined {
        return this.#registry[id];
    }

    public send_change(change: BaseChangeMessage): void {
        this.#comm.send(OBSERVABLE_CLIENT_CHANGE_MSG, change);
    }

    public notify_change(change: BaseChangeMessage): void {
        this.#comm.notify(OBSERVABLE_CHANGE_MSG, change);
    }

    public emit_change(change: BaseChangeMessage): void {
        this.#comm.emit(OBSERVABLE_CHANGE_MSG, change);
    }

    public register(obs: ObservableBase<any, any>): void {
        this.#registry[obs.id] = obs;
        obs.__register(this);
    }

    #recv_change(change: BaseChangeMessage): void {
        const { data_id } = change;
        this.#registry[data_id].__recv_change(change);
    }

}
