import { __uuid4 } from "../utils.js";
import { ObservableChange, ObservableManager } from "./observable_manager.js";


export class Observable<T> {
    private __manager: ObservableManager;
    private __id: string;
    private __value: T;

    constructor(__manager: ObservableManager, __id: string, __value: T) {
        this.__manager = __manager;
        this.__id = __id;
        this.__value = __value;
    }

    get id(): string {
        return this.__id;
    }

    get value(): T {
        return this.get();
    }

    set value(__value: T) {
        this.set(__value);
    }

    get(): T {
        return this.__value;
    }

    set(__value: T): void {
        const old_value = this.__value;
        this.__value = __value;

        const change: ObservableChange<T> = {
            event_id: __uuid4(),
            data_id: this.__id,
            old_value: old_value,
            new_value: __value,
        };

        this.__manager.notify_change(change);
    }
}
