import { ChangeMessage } from "./messages.js";
import { ObservableNetwork } from "./observable_network.js";
import { ObservableSchema } from "./schema.js";
/**
 * Any function that transforms an object of type {@link From} to type {@link To}
 *
 * @template From
 * @template To
 *
 * @export
 */
export type TransformFn<From, To> = (v: From) => To;
/**
 * Tuple of primitive types supported by {@link Observable}
 *
 * @export
 */
export type Primitives = [void, boolean, number, string];
/**
 * Union of primitive types supported by {@link Observable}
 *
 * @export
 */
export type Primitive = Primitives[number];
/**
 * Converts a possible literal primitive to a {@link Primitive}
 *
 * @export
 * @template T
 */
export type PrimitiveOf<T extends Primitive> = T extends boolean ? boolean : T extends number ? number : T extends string ? string : never;
/**
 * Converts a tuple of possible literal primitives to a tuple of {@link Primitive}s
 *
 * @template T
 */
type PrimitiveTuple<T extends Primitive[]> = {
    [P in keyof T]: T[P];
};
/**
 * Identifies the object type associated with a given {@link Primitive}
 *
 * @template T
 */
type ObjectOf<T> = T extends boolean ? Boolean : T extends number ? Number : T extends string ? String : T extends object ? T : never;
/**
 * Either an {@link Observable}<{@link T}> or {@link T}
 *
 * @export
 * @template T
 */
export type ObservableOr<T> = Observable<T> | T;
/**
 * Converts {@link T} to an {@link Observable}<{@link T}> if it's a {@link Primitive}
 *
 * @export
 * @template T
 */
/**
 * Convert a tuple of {@link T} to a tuple of {@link Observable}<{@link T}>
 *
 * @export
 * @template T
 */
export type ObservableTuple<T extends Primitive[]> = {
    [P in keyof T]: Observable<T[P]>;
};
/**
 * Convert a tuple of {@link T} to a tuple of {@link ObservableOr}<{@link T}>
 *
 * @export
 * @template T
 */
export type ObservableOrTuple<T extends Primitive[]> = {
    [P in keyof T]: ObservableOr<T[P]>;
};
/**
 * Convert a dict of {@link T} to a dict of {@link Observable}<{@link T}>
 *
 * @export
 * @template T
 */
export type ObservableDict<T extends {
    [key: string]: Primitive;
}> = {
    [P in keyof T]: Observable<Exclude<T[P], undefined>>;
};
/**
 * Convert a dict of {@link T} to a dict of {@link ObservableOr}<{@link T}>
 *
 * @export
 * @template T
 */
export type ObservableOrDict<T extends {
    [key: string]: Primitive;
}> = {
    [P in keyof T]: ObservableOr<Exclude<T[P], undefined>>;
};
/**
 * Maps a function with Primitive arguments / return to
 * one with equivalent Observable arguments / return.
 *
 * @template T
 */
type ObservableFunction<T extends Function> = T extends (...args: infer A) => (infer R extends Primitive) ? (...args: {
    [P in keyof A]: ObservableOr<A[P]>;
}) => Observable<R> : never;
/**
 * The callable component of the {@link Observable} constructor.
 */
type ObservableCtor = {
    <T>(v: T, kwds?: ObservableKwds): Observable<T>;
    new <T>(v: T, kwds?: ObservableKwds): Observable<T>;
};
/**
 * The static components of the {@link Observable} constructor
 */
declare class ObservableStatic {
    /**
     * Type guard for {@link Observable}s, optionally of a given type.
     *
     * @static
     * @template T
     * @param {*} obj the object to check
     * @param {ConstructorOf<T>} [type] the {@link Primitive} object class type to check for
     * @returns {o is Observable<T>}
     */
    static is_observable<T extends Primitive>(obj: any): obj is Observable<any>;
    static is_observable<T extends boolean>(obj: any, type: BooleanConstructor): obj is Observable<T>;
    static is_observable<T extends number>(obj: any, type: NumberConstructor): obj is Observable<T>;
    static is_observable<T extends string>(obj: any, type: StringConstructor): obj is Observable<T>;
    /**
     * Safely gets a value from an {@link Observable} or {@link Primitive}
     *
     * @static
     * @template T
     * @param {ObservableOr<T>} o an {@link Observable} or {@link Primitive}
     * @returns {T} the value
     */
    static get<T extends Primitive>(o: ObservableOr<T>): T;
    /**
     * Same as {@link get} but applies to a tuple / array. tuple / array may be heterogeneous.
     *
     * @static
     * @template T
     * @param {...ObservableOrTuple<T>} os the {@link Observable}s and or {@link Primitive}s to get the values of.
     * @returns {T} a tuple of values
     */
    static get_all<T extends any[]>(...os: ObservableOrTuple<T>): T;
    /**
     * Watches each of the observables and calls the callback with their values
     * as arguments when any one changes.
     *
     * @static
     * @template T
     * @param {...ObservableOrTuple<T>} [...os] the observables to watch
     * @param {(...args: PrimitiveTuple<T>) => void} fn the callback
     * @example ```ts
     * const num = new Observable(0);
     * const num2 = new Observable(0);
     * Observable.watch(num, num2, (n: number, n2: number) => {
     *     console.log(`num = ${n}, num2 = ${n2}`);
     * });
     * num.set(10); // >> num = 10, num2 = 0
     * num2.set(20); // >> num = 10, num2 = 20
     * ```
     */
    static watch<T extends any[]>(...args: [
        ...ObservableOrTuple<T>,
        (...args: PrimitiveTuple<T>) => void
    ]): void;
    /**
     * Similar to {@link watch} but produces an {@link Observable}<{@link R}> with
     * the result of the callback.
     *
     * @static
     * @template T
     * @template R
     * @param {...ObservableOrTuple<T>} [...os] the observables to watch
     * @param {(...args: PrimitiveTuple<T>) => R} fn the callback
     * @returns {Observable<R>}
     * @example ```ts
     * const num = new Observable(0);
     * const num2 = new Observable(0);
     * const sum = Observable.map(num, num2, (n, n2) => n + n2);
     * sum.watch(v => console.log(`sum = ${v}`))
     * num.set(10); // >> sum = 10
     * num2.set(20); // >> sum = 30
     * ```
     */
    static map<T extends any[], R>(...args: [
        ...ObservableOrTuple<T>,
        (...args: T) => R
    ]): Observable<R>;
    static from_schema<T extends Primitive>(schema: ObservableSchema<T>): Observable<T>;
}
/**
 * An {@link Observable} which provides a reactive
 * interface to an underlying data type. Proxies
 * the methods associtated with the underlying data
 * type such that they return {@link Observable}s
 * with equivalent value, and allow both {@link Primitive}s,
 * and {@link Observable}s as arguments.
 *
 * @export
 * @template T
 * @template O
 */
export type Observable<T, O extends ObjectOf<T> = ObjectOf<T>> = _Observable<T> & {
    [P in keyof O]: O[P] extends Function ? ObservableFunction<O[P]> : O[P] extends Primitive ? Observable<O[P]> : never;
};
/**
 * @param {T} v the initial value
 * @returns {Observable<T>} the observable
 */
export declare const Observable: ObservableCtor & typeof ObservableStatic;
/**
 * The keywords supported by {@link Observable}
 */
type ObservableKwds = {
    id?: string;
    remote?: boolean;
    network?: ObservableNetwork;
};
/**
 * The keyowrds supported by {@link bind}
 *
 * @template T
 * @template R
 */
type BindKwds<T, R> = {
    coerce?: TransformFn<T, R>;
    primary?: "observable" | "target";
    update_observable?: boolean;
    update_target?: boolean;
};
/**
 * The actual {@link Observable} implementation.
 * Because we are using {@link Proxy}, we need to
 * separate the public type / constructor ({@link Observable})
 * from the internal implementation ({@link _Observable})
 *
 * @template T
 */
declare class _Observable<T> {
    #private;
    /**
     * Creates an instance of {@link _Observable}.
     * Private because {@link create} is required for correct typing with {@link Observable}.
     *
     * @constructor
     * @private
     * @param {T} value
     */
    private constructor();
    /**
     * Create an instance of {@link Observable}.
     *
     * @static
     * @template T
     * @param {T} value
     * @returns {Observable<T>}
     */
    static create<T>(value: T, kwds?: ObservableKwds): Observable<T>;
    /**
     * Gets the {@link Observable}'s id
     *
     * @readonly
     */
    get id(): string;
    /**
     * Gets the {@link Observable}'s {@link ObservableNetwork}
     *
     * @readonly
     */
    get network(): ObservableNetwork | void;
    /**
     * Gets the {@link Observable}'s value.
     *
     * @returns {T}
     */
    get(): T;
    /**
     * Sets the {@link Observable}'s value.
     * Emits a change event if {@link coerce}({@link v}) !== {@link get}()
     *
     * @param {*} v
     */
    set(v: any): void;
    /**
     * A {@link TransformFn<any, T>} that coerces any value to {@link T}.
     * Defaults to the constructor function of {@link T}.
     *
     * @type {TransformFn<any, T>}
     */
    coerce: TransformFn<any, T>;
    /**
     * Watches the observable and calls the callback with its value
     * as the argument when changed.
     *
     * @param {TransformFn<T, any>} fn the callback
     * @see {@link Observable.watch}
     */
    watch(fn: TransformFn<T, any>): void;
    /**
     * Similar to {@link watch} but produces an {@link Observable}<{@link R}> with
     * the result of the callback.
     *
     * @template R
     * @param {TransformFn<T, R>} fn the callback
     * @returns {Observable<R>}
     * @see {@link Observable.map}
     */
    map<R>(fn: TransformFn<T, R>): Observable<R>;
    /**
     * Binds an {@link Observable} to an attribute of an object. If the object is an
     * {@link EventTarget}, an event name can be provided to act as a 2 way data-bind.
     *
     * @template O
     * @template K
     * @param {O} obj the object to bind to (must be {@link EventTarget} of {@link event} is provided).
     * @param {K} attr the attribute key to bind to
     * @param {string} [event] the event on {@link obj} to listen for, will check {@link obj}[{@link attr}] for changes when fired.
     * @param {TransformFn<T, O[K]>} [coerce] a {@link TransformFn<T, O[K]>} to coerce values to the necessary type.
     */
    bind<O extends object, K extends keyof O>(obj: O, attr: K): void;
    bind<O extends EventTarget, K extends keyof O>(obj: O, attr: K, event: string | string[]): void;
    bind<O extends object, K extends keyof O>(obj: O, attr: K, kwds: BindKwds<T, O[K]>): void;
    bind<O extends EventTarget, K extends keyof O>(obj: O, attr: K, event: string | string[], kwds: BindKwds<T, O[K]>): void;
    /**
     * Internal method: used by {@link ObservableNetwork} as part of registration
     *
     * @private
     * @param {ObservableNetwork} network
     */
    __register(network: ObservableNetwork): void;
    /**
     * Internal method: used by {@link ObservableNetwork} as part of communication
     *
     * @private
     * @param {ChangeMessage<T>} change
     */
    __recv_change(change: ChangeMessage<T>): void;
}
export {};
