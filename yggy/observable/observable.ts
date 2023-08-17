import { Callable } from "../callable.js";
import { ReceiverFn_t, create_message } from "../comm/index.js";
import { ChangeMessage } from "./messages.js";
import { ObservableManager } from "./observable_manager.js";

export abstract class Observable extends Callable<[any] | [], any> {
    private __manager: ObservableManager;
    private __id: string;

    constructor(__manager: ObservableManager, __id: string) {
        super();
        this.__manager = __manager;
        this.__id = __id;
    }

    get id(): string {
        return this.__id;
    }

    get manager(): ObservableManager {
        return this.__manager;
    }

    abstract watch(fn: ReceiverFn_t): void;

    protected _notify_change<T>(old_value: T, new_value: T): void {
        const change = create_message<ChangeMessage<T>>({
            data_id: this.id,
            new_value: new_value,
            old_value: old_value,
        });

        this.__manager.notify_change(change);
    }

    abstract _recv_change(change: ChangeMessage<any>): void;
}
