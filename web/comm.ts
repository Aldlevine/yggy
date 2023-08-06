import { io, Socket } from "socket.io-client";
import { IComm } from "./icomm.js";

export type HandlerFn_t = (...args: any[]) => any;
export type HandlerInnerFn_t = (handler: HandlerFn_t) => HandlerFn_t;

declare module "./icomm.js" {
    interface IComm {
        recv(message: string, handler: HandlerFn_t): void;
        start(): Promise<void>;
    }
}

class Comm implements IComm {
    _socketio: Socket

    constructor() {
        this._socketio = io();
    }

    recv(message: string, handler: HandlerFn_t): void {
        this._socketio.on(message, handler);
    }

    send(message: string, ...data: any): void {
        this._socketio.emit(message, ...data);
    }

    async start(): Promise<void> {
        let promise = new Promise((res, _rej) => {
            this._socketio.once("start", res);
        });
        this.send("start");
        await promise;
    }
}

export const comm: IComm = new Comm();