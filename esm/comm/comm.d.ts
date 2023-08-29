export type GlobalReceiverFn_t = (msg: string, data: any) => any;
export type ReceiverFn_t = (data: any) => any;
export declare class Comm {
    #private;
    get id(): string;
    get open(): boolean;
    stop(): void;
    add_sender(sender: GlobalReceiverFn_t): void;
    send(msg: string, data: any): void;
    notify(msg: string, data: any): void;
    recv(fn: GlobalReceiverFn_t): void;
    recv(msg: string, fn: ReceiverFn_t): void;
    unrecv(msg: string, fn: ReceiverFn_t): void;
}
