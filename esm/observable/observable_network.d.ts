import { Comm } from "../comm/comm.js";
import { BaseChangeMessage } from "./messages.js";
import { ObservableBase } from "./observable_base.js";
import { BaseObservableSchema } from "./schema.js";
export declare class ObservableNetwork {
    #private;
    constructor(comm: Comm);
    get comm(): Comm;
    get<T extends BaseObservableSchema, U extends BaseChangeMessage>(id: string): ObservableBase<T, U> | undefined;
    send_change(change: BaseChangeMessage): void;
    notify_change(change: BaseChangeMessage): void;
    emit_change(change: BaseChangeMessage): void;
    register(obs: ObservableBase<any, any>): void;
}
