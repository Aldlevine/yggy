import { ReceiverFn_t } from "../comm/__init__.js";
import { ChangeMessage } from "./messages.js";
import { ObservableNetwork } from "./observable_network.js";
import { ObservableSchema } from "./schema.js";
export type ObservableOr<T> = T extends {
    [key: string]: any;
} ? {
    [P in keyof T]: Observable<Exclude<T[P], undefined>> | Exclude<T[P], undefined>;
} : (Observable<T> | T);
type ObservableKwds = {
    local?: boolean;
};
export type ObservableProxy<T> = {
    [P in keyof T]: T[P] extends (..._: infer A) => infer R ? (..._: A) => Observable<R> & ObservableProxy<R> : never;
};
export declare function get<T>(obs: Observable<T> | T): T;
export declare class Observable<T> {
    #private;
    private constructor();
    static create<U>(__id: string, __value: U, __kwds?: ObservableKwds): Observable<U> & ObservableProxy<U>;
    static create_proxy<U>(obs: Observable<U>): Observable<U> & ObservableProxy<U>;
    get id(): string;
    get network(): ObservableNetwork | void;
    static from_schema<T>(__schema: ObservableSchema<T>): Observable<T> & ObservableProxy<T>;
    register(__network: ObservableNetwork): void;
    get(): T;
    set(__value: T): void;
    watch(__fn: ReceiverFn_t): void;
    __recv_change(change: ChangeMessage<T>): void;
}
export {};
