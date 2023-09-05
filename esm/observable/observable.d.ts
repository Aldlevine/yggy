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
export declare function get<T>(obs: Observable<T> | T): T;
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
    replace(this: Observable<string>, searchValue: {
        [Symbol.replace](string: string, replaceValue: string): string;
    }, replaceValue: string): Observable<string>;
    replace(this: Observable<string>, searchValue: {
        [Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string;
    }, replacer: (substring: string, ...args: any[]) => string): Observable<string>;
    replace(this: Observable<string>, searchValue: string | RegExp, replaceValue: string): Observable<string>;
    replace(this: Observable<string>, searchValue: string | RegExp, replacer: (substring: string, ...args: any[]) => string): Observable<string>;
    replaceAll(this: Observable<string>, searchValue: string | RegExp, replaceValue: string): Observable<string>;
    replaceAll(this: Observable<string>, searchValue: string | RegExp, replacer: (substring: string, ...args: any[]) => string): Observable<string>;
    search(this: Observable<string>, searcher: {
        [Symbol.search](string: string): number;
    }): Observable<number>;
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
export declare class Observable<T> {
    #private;
    private constructor();
    static create<T>(__id: string, __value: T, __kwds?: ObservableKwds): Observable<T>;
    static from_schema<T>(__schema: ObservableSchema<T>): Observable<T>;
    get id(): string;
    get network(): ObservableNetwork | void;
    register(__network: ObservableNetwork): void;
    get(): T;
    set(__value: T): void;
    watch(__fn: ReceiverFn_t): void;
    map<R>(__fn: (v: T) => R): Observable<R>;
    __recv_change(change: ChangeMessage<T>): void;
}
export {};
