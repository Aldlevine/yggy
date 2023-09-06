export class CommWS {
    #comm;
    #host;
    #port;
    #websocket;
    #open;
    #shutdown = false;
    constructor(comm, host = "localhost", port = 5678) {
        this.#comm = comm;
        this.#host = host;
        this.#port = port;
        this.#create_websocket();
        comm.add_sender(this.#onsend.bind(this));
    }
    get comm() {
        return this.#comm;
    }
    get host() {
        return this.#host;
    }
    get port() {
        return this.#port;
    }
    close() {
        this.#shutdown = true;
        this.#websocket.close();
    }
    #create_websocket() {
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
        catch (err) {
            setTimeout(() => this.#create_websocket(), 1000);
        }
    }
    #onsend(msg, data) {
        this.#websocket.send(JSON.stringify({ msg, data }));
    }
    #onmessage({ data: json_data }) {
        const { msg, data } = JSON.parse(json_data);
        this.#comm.notify(msg, data);
    }
    #onopen(ev) {
        console.log("OPEN");
    }
    #onerror(ev) {
        console.log("ERROR");
    }
    #onclose(ev) {
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
