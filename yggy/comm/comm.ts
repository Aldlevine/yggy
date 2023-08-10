export type GlobalReceiverFn_t = (msg: string, data: any) => any;
export type ReceiverFn_t = (data: any) => any;

import { __get_default, __set_default, __uuid4 } from "../utils.js";

export class Comm {
    private __id: string = __uuid4()
    private __senders: GlobalReceiverFn_t[] = [];

    private __receivers: { [key: string]: ReceiverFn_t[] } = {};
    private __global_receivers: GlobalReceiverFn_t[] = [];

    get id() { return this.__id; }

    add_sender(sender: GlobalReceiverFn_t): void {
        if (this.__senders.includes(sender)) { return; }
        this.__senders.push(sender);
    }

    send(msg: string, data: any): void {
        for (let sender of this.__senders) {
            sender(msg, data);
        }
    }

    notify(msg: string, data: any): void {
        for (let receiver of this.__global_receivers) {
            receiver(msg, data);
        }
        const receivers = __get_default(this.__receivers, msg, () => []);
        for (let receiver of receivers) {
            receiver(data);
        }
    }

    recv(fn: GlobalReceiverFn_t): void;

    recv(msg: string, fn: ReceiverFn_t): void;

    recv(arg0: string | GlobalReceiverFn_t, arg1?: ReceiverFn_t): void {
        // overload 1
        if (typeof arg0 === "function" && !arg1) {
            if (!this.__global_receivers.includes(arg0)) {
                this.__global_receivers.push(arg0);
            }
            return;
        }

        // overload 2
        if (typeof arg0 === "string" && arg1 instanceof Function) {
            const receivers = __set_default(this.__receivers, arg0, () => []);
            if (!receivers.includes(arg1)) {
                receivers.push(arg1);
            }
            return;
        }

        throw new TypeError("invalid arguments to Comm.recv");
    }

    unrecv(msg: string, fn: ReceiverFn_t): void {
        const receivers = __get_default(this.__receivers, msg, null);

        if (!receivers) { return; }

        const index = receivers.indexOf(fn);

        if (index == -1) { return; }

        receivers.splice(index, 1);
    }
}