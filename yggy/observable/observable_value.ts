import { ReceiverFn_t } from "../index.js";
import { ChangeMessage, OBSERVABLE_CHANGE_MSG } from "./messages.js";
import { Observable } from "./observable.js";
import { ObservableManager } from "./observable_manager.js";

export class ObservableValue<T> extends Observable {
    __value: T;

    constructor(__manager: ObservableManager, __id: string, __value: T) {
        super(__manager, __id);
        this.__value = __value;
    }

    __call__(__value?: T): T | void {
        if (typeof __value === "undefined") {
            return this.get();
        }
        else {
            this.set(__value);
        }
    }

    get(): T {
        return this.__value;
    }

    set(__value: T): void {
        const old_value = this.__value;
        this.__value = __value;

        this._notify_change(old_value, __value);
    }

    watch(__fn: ReceiverFn_t): void {
        this.manager.comm.recv(OBSERVABLE_CHANGE_MSG, (__change: ChangeMessage<any>) => {
            if (__change["data_id"] != this.id) { return; }
            __fn(__change);
        });
    }

    _recv_change(change: ChangeMessage<T>): void {
        this.set(change.new_value);
    }
}
