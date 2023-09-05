import { watch } from "../__init__.js";
import { ReceiverFn_t, create_message } from "../comm/__init__.js";
import { weakref } from "../utils/__init__.js";
import { ObjectOf } from "../utils/objecttools.js";
import { ChangeMessage, OBSERVABLE_CHANGE_MSG } from "./messages.js";
import { ObservableNetwork } from "./observable_network.js";
import { ObservableSchema } from "./schema.js";

export type ObservableOr<T> =
    T extends { [key: string]: any }
    ? {
        [P in keyof T]:
        Observable<Exclude<T[P], undefined>> |
        Exclude<T[P], undefined>;
    }
    : (Observable<T> | T);

type ObservableKwds = {
    local?: boolean;
}


export function get<T>(obs: Observable<T> | T): T {
    if (obs instanceof Observable) {
        return obs.get();
    }
    return obs;
}

class ObservableProxyHandler {
    static get<T extends Observable<any>>(target: T, p: string | symbol, receiver: any) {
        {
            const value = target.get();
            const attr = (value !== undefined && value !== null) && value[p as keyof T];
            if (attr) {
                if (typeof attr === "function") {
                    return (...args: any[]) => watch([target], () => {
                        return attr.call(target.get(), ...args);
                    });
                }
            }
        }

        {
            const attr = target[p as keyof T];
            if (typeof attr === "function") {
                return (...args: any[]) => attr.call(target, ...args);
            }
            return attr;
        }
    }
}

// export type Observable<T> = ObservableBase<T> & {
//     [P in keyof ObjectOf<T>]:
//     ObjectOf<T>[P] extends ((..._: infer A) => infer R)
//     ? ((..._: A) => Observable<R>)
//     : never
// };

export interface Observable<T> {
    toString(): Observable<string>;

    toExponential(this: Observable<number>, fractionDigits?: number): Observable<string>;
    toFixed(this: Observable<number>, fractionDigits?: number): Observable<string>;
    toPrecision(this: Observable<number>, fractionDigits?: number): Observable<string>;
    toString(this: Observable<number>, radix?: number): Observable<string>;

    at(this: Observable<string>, index: number): Observable<string>;
    charAt(this: Observable<string>, pos: number): Observable<string>;
    charCodeAt(this: Observable<string>, index: number): Observable<number>;
    codePointAt(this: Observable<string>, pos: number): Observable<number | undefined>;
    concat(this: Observable<string>, ...strings: string[]): Observable<string>;
    endsWith(this: Observable<string>, searchString: string, endPosition?: number | undefined): Observable<boolean>;
    includes(this: Observable<string>, searchString: string, position?: number | undefined): Observable<boolean>;
    indexOf(this: Observable<string>, searchString: string, position?: number | undefined): Observable<number>;
    lastIndexOf(this: Observable<string>, searchString: string, position?: number | undefined): Observable<number>;
    localeCompare(this: Observable<string>, that: string): Observable<number>;
    normalize(this: Observable<string>, form?: "NFC" | "NFD" | "NFKC" | "NFKD"): Observable<string>;
    padEnd(this: Observable<string>, maxLength: number, fillString?: string | undefined): Observable<string>;
    padStart(this: Observable<string>, maxLength: number, fillString?: string | undefined): Observable<string>;
    repeat(this: Observable<string>, count: number): Observable<string>;
    replace(this: Observable<string>, searchValue: { [Symbol.replace](string: string, replaceValue: string): string; }, replaceValue: string): Observable<string>;
    replace(this: Observable<string>, searchValue: { [Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string; }, replacer: (substring: string, ...args: any[]) => string): Observable<string>;
    replace(this: Observable<string>, searchValue: string | RegExp, replaceValue: string): Observable<string>;
    replace(this: Observable<string>, searchValue: string | RegExp, replacer: (substring: string, ...args: any[]) => string): Observable<string>;
    replaceAll(this: Observable<string>, searchValue: string | RegExp, replaceValue: string): Observable<string>;
    replaceAll(this: Observable<string>, searchValue: string | RegExp, replacer: (substring: string, ...args: any[]) => string): Observable<string>;
    search(this: Observable<string>, searcher: { [Symbol.search](string: string): number; }): Observable<number>;
    search(this: Observable<string>, regexp: string | RegExp): Observable<number>;
    slice(this: Observable<string>, start?: number | undefined, end?: number | undefined): Observable<string>;
    startsWith(this: Observable<string>, searchString: string, position?: number | undefined): Observable<boolean>;
    substring(this: Observable<string>, start: number, end?: number | undefined): Observable<string>;
    toLocaleLowerCase(this: Observable<string>, locales?: string | string[] | undefined): Observable<string>;
    toLocaleUpperCase(this: Observable<string>, locales?: string | string[] | undefined): Observable<string>;
    toLowerCase(this: Observable<string>): Observable<string>;
    toUpperCase(this: Observable<string>): Observable<string>;
    trim(this: Observable<string>): Observable<string>;
    trimEnd(this: Observable<string>): Observable<string>;
    trimStart(this: Observable<string>): Observable<string>;
}

export class Observable<T> {
    #network?: ObservableNetwork;
    #id: string;
    #value: T;
    #receivers: weakref.IterableWeakMap<ReceiverFn_t, ReceiverFn_t>;
    #local: boolean;

    private constructor(__id: string, __value: T, __kwds: ObservableKwds = {}) {
        this.#id = __id;
        this.#value = __value;
        this.#receivers = new weakref.IterableWeakMap();
        this.#local = __kwds.local ?? false;
    }

    static create<T>(__id: string, __value: T, __kwds: ObservableKwds = {}): Observable<T> {
        const obs = new Observable(__id, __value, __kwds);
        return new Proxy(obs, ObservableProxyHandler) as Observable<T>;
    }

    static from_schema<T>(__schema: ObservableSchema<T>): Observable<T> {
        return this.create(__schema.data_id, __schema.value);
    }

    get id(): string {
        return this.#id;
    }

    get network(): ObservableNetwork | void {
        return this.#network;
    }

    register(__network: ObservableNetwork): void {
        this.#network = __network;
        for (let fn of this.#receivers.values()) {
            this.#network.comm.recv(OBSERVABLE_CHANGE_MSG, fn);
        }
    }

    get(): T {
        return this.#value;
    }

    set(__value: T): void {
        this.#value = __value;

        this.#notify_change();
    }

    watch(__fn: ReceiverFn_t): void {
        const __recv_change = (__change: ChangeMessage<any>) => {
            if (__change["data_id"] != this.id) { return; }
            __fn(__change);
        };

        this.#receivers.set(__fn, __recv_change);
        this.#network?.comm.recv(OBSERVABLE_CHANGE_MSG, __recv_change);
    }

    map<R>(__fn: (v: T) => R): Observable<R> {
        return watch([this], () => {
            return __fn(this.get());
        });
    }

    #notify_change(): void {
        const change = create_message<ChangeMessage<T>>({
            data_id: this.#id,
            new_value: this.#value,
        });

        if (this.#local) {
            this.#network?.notify_change(change);
        }
        else {
            this.#network?.send_change(change);
        }
    }

    __recv_change(change: ChangeMessage<T>): void {
        this.set(change.new_value);
    }
}
