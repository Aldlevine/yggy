import { Comm } from "../comm/comm.js";
import {
    ChangeMessage,
    OBSERVABLE_CHANGE_MSG,
    OBSERVABLE_CLIENT_CHANGE_MSG,
} from "./messages.js";
import { Observable, Primitive } from "./observable.js";

export class ObservableNetwork {
    #registry: { [key: string]: Observable<any> };
    #updating: Set<string>;
    #comm: Comm;

    constructor(comm: Comm) {
        this.#registry = {};
        this.#updating = new Set();
        this.#comm = comm;

        this.#comm.recv(OBSERVABLE_CHANGE_MSG, this.#recv_change.bind(this));
    }

    public get comm(): Comm {
        return this.#comm;
    }

    public get<T extends Primitive>(id: string): Observable<T> | undefined {
        return <Observable<T>>this.#registry[id];
    }

    public send_change<T>(change: ChangeMessage<T>): void {
        if (this.#updating.has(change.data_id)) {
            return;
        }

        this.#comm.send(OBSERVABLE_CLIENT_CHANGE_MSG, change);
    }

    public notify_change<T>(change: ChangeMessage<T>): void {
        this.#comm.notify(OBSERVABLE_CHANGE_MSG, change);
    }

    public register<T>(obs: Observable<T>): void {
        this.#registry[obs.id] = obs;
        obs.__register(this);
    }

    #recv_change<T>(change: ChangeMessage<T>): void {
        const { data_id } = change;

        if (this.#updating.has(data_id)) {
            return;
        }
        this.#updating.add(data_id);

        this.#registry[data_id].__recv_change(change);

        this.#updating.delete(data_id);
    }

}
