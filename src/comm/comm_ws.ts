import { Comm } from "./comm.js";

export class CommWS {
    #comm: Comm;
    #host: string;
    #port: number;
    #websocket!: WebSocket;
    #open!: boolean;
    #shutdown: boolean = false;

    constructor(comm: Comm, host: string = "localhost", port: number = 5678) {
        this.#comm = comm;
        this.#host = host;
        this.#port = port;

        this.#create_websocket();

        comm.add_sender(this.#onsend.bind(this));
    }

    get comm(): Comm {
        return this.#comm;
    }
    get host(): string {
        return this.#host;
    }
    get port(): number {
        return this.#port;
    }

    close(): void {
        this.#shutdown = true;
        this.#websocket.close();
    }

    #create_websocket(): void {
        if (this.#open) {
            console.trace("cannot create multiple websockets");
            return;
        }
        this.#open = true;

        try {
            this.#websocket = new WebSocket(`ws://${this.host}:${this.port}`);

            this.#websocket.onopen = this.#onopen.bind(this);
            this.#websocket.onerror = this.#onerror.bind(this);
            this.#websocket.onclose = this.#onclose.bind(this);
            this.#websocket.onmessage = this.#onmessage.bind(this);
        }
        catch (err: any) {
            setTimeout(() => this.#create_websocket(), 1000);
        }
    }

    #onsend(msg: string, data: any): void {
        this.#websocket.send(JSON.stringify({ msg, data }));
    }

    #onmessage({ data: json_data }: MessageEvent): void {
        const { msg, data } = JSON.parse(json_data);
        this.#comm.notify(msg, data);
    }

    #onopen(ev: Event): void {
        console.log("OPEN");
    }

    #onerror(ev: Event): void {
        console.log("ERROR");
    }

    #onclose(ev: CloseEvent): void {
        console.log("CLOSE");
        if (this.#open) {
            this.#open = false;
            if (this.#comm.open) {
                this.#comm.notify("comm.closed", {});
            }
            if (!this.#shutdown) {
                setTimeout(() => this.#create_websocket(), 1000);
            }
        }
    }
}
