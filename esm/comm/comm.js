import { dicttools, uuid } from "../utils/__init__.js";
export class Comm {
    #id = uuid.uuid4();
    #senders = [];
    #receivers = {};
    #global_receivers = [];
    #open = true;
    get id() {
        return this.#id;
    }
    get open() {
        return this.#open;
    }
    #require_open() {
        if (!this.#open) {
            throw new Error("comm closed");
        }
    }
    stop() {
        this.send("comm.closed", {});
        this.#senders = [];
        this.#receivers = {};
        this.#global_receivers = [];
        this.#open = false;
    }
    add_sender(sender) {
        this.#require_open();
        if (this.#senders.includes(sender)) {
            return;
        }
        this.#senders.push(sender);
    }
    send(msg, data) {
        this.#require_open();
        for (let sender of this.#senders) {
            sender(msg, data);
        }
    }
    notify(msg, data) {
        this.#require_open();
        for (let receiver of this.#global_receivers) {
            receiver(msg, data);
        }
        const receivers = dicttools.get_default(this.#receivers, msg, () => []);
        for (let receiver of receivers) {
            receiver(data);
        }
    }
    recv(arg0, arg1) {
        this.#require_open();
        // overload 1
        if (typeof arg0 === "function" && !arg1) {
            return this.#recv_global(arg0);
        }
        // overload 2
        if (typeof arg0 === "string" && arg1 instanceof Function) {
            return this.#recv_named(arg0, arg1);
        }
        throw new TypeError("invalid arguments to Comm.recv");
    }
    #recv_global(fn) {
        if (!this.#global_receivers.includes(fn)) {
            this.#global_receivers.push(fn);
        }
    }
    #recv_named(arg0, arg1) {
        const receivers = dicttools.set_default(this.#receivers, arg0, () => []);
        if (!receivers.includes(arg1)) {
            receivers.push(arg1);
        }
    }
    unrecv(msg, fn) {
        const receivers = dicttools.get_default(this.#receivers, msg, null);
        if (!receivers) {
            return;
        }
        const index = receivers.indexOf(fn);
        if (index == -1) {
            return;
        }
        receivers.splice(index, 1);
    }
}
