import { Comm } from "./comm.js";

export class CommWS {
    private __comm: Comm;
    private __host: string;
    private __port: number;
    private __websocket!: WebSocket;
    private __closed!: boolean;

    constructor(comm: Comm, host: string = "localhost", port: number = 5678) {
        this.__comm = comm;
        this.__host = host;
        this.__port = port;

        this.__create_websocket();

        comm.add_sender(this.__onsend.bind(this));
    }

    get comm(): Comm {
        return this.__comm;
    }
    get host(): string {
        return this.__host;
    }
    get port(): number {
        return this.__port;
    }

    close(): void {
        this.__closed = true;
        this.__websocket.close();
    }

    __create_websocket(): void {
        this.__closed = false;

        if (this.__websocket != null) {
            this.__websocket.close();
        }

        this.__websocket = new WebSocket(`ws://${this.host}:${this.port}`);

        this.__websocket.onopen = this.__onopen.bind(this);
        this.__websocket.onerror = this.__onerror.bind(this);
        this.__websocket.onclose = this.__onclose.bind(this);
        this.__websocket.onmessage = this.__onmessage.bind(this);
    }

    __onsend(msg: string, data: any): void {
        this.__websocket.send(JSON.stringify({ msg, data }));
    }

    __onmessage({ data: __data }: MessageEvent): void {
        const { msg, data } = JSON.parse(__data);
        this.__comm.notify(msg, data);
    }

    __onopen(ev: Event): void {
        console.log("OPEN");
    }

    __onerror(ev: Event): void {
        console.log("ERROR");
    }

    __onclose(ev: CloseEvent): void {
        console.log("CLOSE");
        if (!this.__closed) {
            setTimeout(() => this.__create_websocket());
        }
    }
}
