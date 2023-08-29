import { Comm } from "./comm.js";
export declare class CommWS {
    #private;
    constructor(comm: Comm, host?: string, port?: number);
    get comm(): Comm;
    get host(): string;
    get port(): number;
    close(): void;
}
