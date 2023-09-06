import { Comm } from "../comm/comm.js";
import { ChangeMessage } from "./messages.js";
import { Observable, Primitive } from "./observable.js";
export declare class ObservableNetwork {
    #private;
    constructor(__comm: Comm);
    get comm(): Comm;
    get<T extends Primitive>(__id: string): Observable<T> | undefined;
    send_change<T>(__change: ChangeMessage<T>): void;
    notify_change<T>(__change: ChangeMessage<T>): void;
    register<T>(__obs: Observable<T>): void;
}
