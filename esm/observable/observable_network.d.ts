import { Comm } from "../comm/comm.js";
import { ChangeMessage } from "./messages.js";
import { Observable } from "./observable.js";
export declare class ObservableNetwork {
    #private;
    constructor(__comm: Comm);
    get comm(): Comm;
    get(__id: string | number): Observable<any> | undefined;
    send_change(__change: ChangeMessage<any>): void;
    notify_change(__change: ChangeMessage<any>): void;
    register(__obs: Observable<any>): void;
}
