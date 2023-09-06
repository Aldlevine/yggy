import { Comm } from "../comm/comm.js";
import { ChangeMessage } from "./messages.js";
import { Observable, Primitive } from "./observable.js";
export declare class ObservableNetwork {
    #private;
    constructor(comm: Comm);
    get comm(): Comm;
    get<T extends Primitive>(id: string): Observable<T> | undefined;
    send_change<T>(change: ChangeMessage<T>): void;
    notify_change<T>(change: ChangeMessage<T>): void;
    register<T>(obs: Observable<T>): void;
}
