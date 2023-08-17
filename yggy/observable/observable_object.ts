import { ReceiverFn_t } from "../index.js";
import { ChangeMessage } from "./messages.js";
import { Observable } from "./observable.js";
import { ObservableManager } from "./observable_manager.js";

export class ObservableObject extends Observable {
    __attrs: { [key: string]: string };

    constructor(
        __manager: ObservableManager,
        __id: string,
        __attrs: { [key: string]: string }
    ) {
        super(__manager, __id);
        this.__attrs = __attrs;

        for (let key in this.__attrs) {
            // @ts-ignore
            this[key] = this.manager.get(this.__attrs[key])!;
        }
    }

    __call__(): void {
    }

    _recv_change(_change: ChangeMessage<any>): void { }

    watch(fn: ReceiverFn_t): void {
        throw "Not Implemented";
    }
}
