import { ReceiverFn_t, create_message } from "../comm/__init__.js";
import { weakref } from "../utils/__init__.js";
import { get_default } from "../utils/dicttools.js";
import { WritableKeys } from "../utils/types.js";
import { uuid4 } from "../utils/uuid.js";
import { ChangeMessage, OBSERVABLE_CHANGE_MSG } from "./messages.js";
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
export type PrimitiveOf<T extends Primitive> =
    T extends boolean ? boolean :
    T extends number ? number :
    T extends string ? string :
    never;


/**
 * Converts a tuple of possible literal primitives to a tuple of {@link Primitive}s
 *
 * @template T
 */
type PrimitiveTuple<T extends Primitive[]> = {
    [P in keyof T]: T[P];
}


/**
 * Identifies the object type associated with a given {@link Primitive}
 *
 * @template T
 */
type ObjectOf<T> =
    T extends boolean ? Boolean :
    T extends number ? Number :
    T extends string ? String :
    T extends object ? T :
    never;


/**
 * Identifies the constructor type associated with a given {@link Primitive}
 *
 * @template T
 */
type ConstructorOf<T> =
    T extends boolean | Boolean ? BooleanConstructor :
    T extends number | Number ? NumberConstructor :
    T extends string | String ? StringConstructor :
    never;


/**
 * Gets the constructor function for a given {@link Primitive}
 *
 * @template T
 * @param {T} v the primitive
 * @returns {ConstructorOf<T>}
 */
function ctor_of<T>(v: T): ConstructorOf<T> | void {
    if (typeof v === "boolean") {
        return Boolean as ConstructorOf<T>;
    }
    if (typeof v === "number") {
        return Number as ConstructorOf<T>;
    }
    if (typeof v === "string") {
        return String as ConstructorOf<T>;
    }
}


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
export type ObservableDict<T extends { [key: string]: Primitive }> = {
    [P in keyof T]: Observable<T[P]>
}


/**
 * Convert a dict of {@link T} to a dict of {@link ObservableOr}<{@link T}>
 *
 * @export
 * @template T
 */
export type ObservableOrDict<T extends { [key: string]: Primitive }> = {
    [P in keyof T]: ObservableOr<T[P]>
}


/**
 * Maps a function with Primitive arguments / return to
 * one with equivalent Observable arguments / return.
 * 
 * @template T
 */
type ObservableFunction<T extends Function> =
    T extends (...args: infer A) => (infer R extends Primitive)
    ? (...args: { [P in keyof A]: ObservableOr<A[P]> }) => Observable<R>
    : never;


/**
 * The callable component of the {@link Observable} constructor.
 */
type ObservableCtor = {
    <T>(v: T, kwds?: ObservableKwds): Observable<T>;
    new <T>(v: T, kwds?: ObservableKwds): Observable<T>;
}


/**
 * The static components of the {@link Observable} constructor
 */
class ObservableStatic {
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
    static is_observable<T extends Primitive>(obj: any, type?: ConstructorOf<T>): obj is Observable<T> {
        if (!(obj instanceof _Observable)) {
            return false;
        }

        if (type === Boolean) {
            return typeof obj.get() === "boolean";
        }
        if (type === Number) {
            return typeof obj.get() === "number";
        }
        if (type === String) {
            return typeof obj.get() === "string";
        }
        return !type || obj.get() instanceof type;
    }


    /**
     * Safely gets a value from an {@link Observable} or {@link Primitive}
     *
     * @static
     * @template T
     * @param {ObservableOr<T>} o an {@link Observable} or {@link Primitive}
     * @returns {T} the value
     */
    static get<T extends Primitive>(o: ObservableOr<T>): T {
        if (ObservableStatic.is_observable(o)) {
            return o.get();
        }
        return o;
    }


    /**
     * Same as {@link get} but applies to a tuple / array. tuple / array may be heterogeneous.
     *
     * @static
     * @template T
     * @param {...ObservableOrTuple<T>} os the {@link Observable}s and or {@link Primitive}s to get the values of.
     * @returns {T} a tuple of values
     */
    static get_all<T extends any[]>(...os: ObservableOrTuple<T>): T {
        return os.map(ObservableStatic.get) as T;
    }


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
    static watch<T extends any[]>(
        ...args: [
            ...ObservableOrTuple<T>,
            (...args: PrimitiveTuple<T>) => void
        ]
    ): void {
        const fn = <(...args: T) => void>args.pop();
        const args_ = <ObservableOrTuple<T>>args;
        const handler = () => {
            fn.call(null, ...Observable.get_all(...args_) as T);
        }
        for (let o of args_) {
            if (Observable.is_observable(o)) {
                o.watch(handler);
            }
        }
    }


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
    static map<
        T extends any[],
        R
    >(
        ...args: [
            ...ObservableOrTuple<T>,
            (...args: T) => R
        ]
    ): Observable<R> {
        const fn = <(...args: T) => R>args.pop();
        const args_ = <ObservableOrTuple<T>>args;
        const value = fn.call(null, ...Observable.get_all(...args_) as T);
        const result = new Observable(value);
        ObservableStatic.watch(...args_, (...values: T) => {
            const value = fn.call(null, ...values);
            result.set(value);
        });
        let network: ObservableNetwork | null = null;
        for (let o of args_) {
            if (Observable.is_observable(o) && o.network) {
                network = o.network;
                break;
            }
        }
        if (network) {
            network.register(result);
        }
        return result;
    }

    static from_schema<T extends Primitive>(schema: ObservableSchema<T>): Observable<T> {
        return new Observable(schema.value, { id: schema.data_id, remote: true });
    }
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
    [P in keyof O]:
    O[P] extends Function
    ? ObservableFunction<O[P]>
    : O[P] extends Primitive
    ? Observable<O[P]>
    : never;
}


/**
 * @param {T} v the initial value
 * @returns {Observable<T>} the observable
 */
export const Observable = function <T>(v: T, kwds?: ObservableKwds): Observable<T> {
    return _Observable.create(v, kwds);
} as (ObservableCtor & typeof ObservableStatic);

/** apply {@link ObservableStatic} to {@link Observable} */
for (let key of Object.getOwnPropertyNames(ObservableStatic)) {
    Object.defineProperty(Observable, key, {
        value: ObservableStatic[key as keyof ObservableStatic]
    });
}
Object.defineProperty(Observable, Symbol.hasInstance, {
    value: (o: any) => o instanceof _Observable
});


/**
 * A {@link ProxyHandler} that either forwards directly to {@link _Observable}
 * OR to a wrapper around the underlying {@link Primitive}'s method / accessor
 * which returns an {@link Observable} which reevaluates whenever the parent
 * {@link Observable}(s) change.
 *
 * @implements {ProxyHandler<_Observable<T>>}
 */
class _ObservableProxyHandler implements ProxyHandler<_Observable<any>> {
    static get<T>(
        target: _Observable<T>,
        p: string | symbol,
        _receiver: any
    ): any {
        const value = target.get();
        if (value !== null && value !== undefined) {
            const attr = value[p as keyof T];
            if (typeof attr === "function") {
                return (...args: any[]) => {
                    const observables: Observable<any>[] = [target, ...args.filter(Observable.is_observable)];
                    const value = (<Function>attr).apply(target.get(), Observable.get_all(...args))
                    const result = Observable(value);
                    Observable.watch(...observables, (..._: any[]) => {
                        result.set((<Function>attr).call(target.get(), ...Observable.get_all(...args)));
                    });
                    target.network?.register(result);
                    return result;
                }
            }
            else if (attr !== undefined) {
                return target.map(v => v[p as keyof T] as Primitive);
            }
        }

        const attr = target[p as keyof _Observable<T>];
        if (typeof attr === "function") {
            return attr.bind(target);
        }

        return target[p as keyof _Observable<T>];
    }

    static set<T>(
        target: _Observable<T>,
        p: string | symbol,
        value: T,
        _receiver: any
    ): boolean {
        const desc = Object.getOwnPropertyDescriptor(target, p);
        if (desc?.set) {
            desc.set.call(target, value);
        }
        else {
            target[p as WritableKeys<_Observable<T>>] = value as any;
        }
        return true;
    }
}


/**
 * The keywords supported by {@link Observable}
 */
type ObservableKwds = {
    id?: string;
    remote?: boolean;
    network?: ObservableNetwork,
}



/**
 * The keyowrds supported by {@link bind}
 * 
 * @template T
 * @template R
 */
type BindKwds<T, R> = {
    coerce?: TransformFn<T, R>,
    primary?: "observable" | "target"
    update_observable?: boolean
    update_target?: boolean
}


/**
 * The actual {@link Observable} implementation.
 * Because we are using {@link Proxy}, we need to
 * separate the public type / constructor ({@link Observable})
 * from the internal implementation ({@link _Observable})
 *
 * @template T
 */
class _Observable<T> {
    #value: T;
    #id: string
    #remote: boolean
    #network?: ObservableNetwork
    #receivers: weakref.IterableWeakMap<ReceiverFn_t, ReceiverFn_t>;


    /**
     * Creates an instance of {@link _Observable}.
     * Private because {@link create} is required for correct typing with {@link Observable}.
     *
     * @constructor
     * @private
     * @param {T} value
     */
    private constructor(value: T, kwds: ObservableKwds = {}) {
        this.#value = value;
        this.#id = get_default(kwds, "id", uuid4());
        this.#remote = get_default(kwds, "remote", false);
        this.#network = get_default(kwds, "network", undefined);
        this.#receivers = new weakref.IterableWeakMap();
        const defaultCoerce = ctor_of<T>(this.get());
        if (defaultCoerce) {
            this.coerce = (v) => defaultCoerce(v) as T;
        }
        else {
            this.coerce = (v) => v;
        }

    }


    /**
     * Create an instance of {@link Observable}.
     *
     * @static
     * @template T
     * @param {T} value
     * @returns {Observable<T>}
     */
    static create<T>(value: T, kwds?: ObservableKwds): Observable<T> {
        return new Proxy(new _Observable(value, kwds), _ObservableProxyHandler) as Observable<T>;
    }


    /**
     * Gets the {@link Observable}'s id
     *
     * @readonly
     */
    get id(): string {
        return this.#id;
    }


    /**
     * Gets the {@link Observable}'s {@link ObservableNetwork}
     *
     * @readonly
     */
    get network(): ObservableNetwork | void {
        return this.#network;
    }


    /**
     * Gets the {@link Observable}'s value.
     *
     * @returns {T}
     */
    get(): T {
        return this.#value;
    }


    /**
     * Sets the {@link Observable}'s value.
     * Emits a change event if {@link coerce}({@link v}) !== {@link get}()
     *
     * @param {*} v
     */
    set(v: any) {
        v = this.coerce(v);
        if (this.#value !== v) {
            this.#value = v;
            this.#notify_change();
        }
    }


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
    watch(fn: TransformFn<T, any>): void {
        const __recv_change = (change: ChangeMessage<any>) => {
            if (change["data_id"] != this.id) { return; }
            fn(change.new_value);
        };

        this.#receivers.set(fn, __recv_change);
        this.#network?.comm.recv(OBSERVABLE_CHANGE_MSG, __recv_change);
    }


    /**
     * Similar to {@link watch} but produces an {@link Observable}<{@link R}> with
     * the result of the callback.
     *
     * @template R
     * @param {TransformFn<T, R>} fn the callback
     * @returns {Observable<R>}
     * @see {@link Observable.map}
     */
    map<R>(fn: TransformFn<T, R>): Observable<R> {
        const result = _Observable.create(fn(this.get()));
        this.watch(v => {
            result.set(fn(v));
        });
        if (this.#network) {
            this.#network.register(result);
        }
        return result;
    }


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

    bind<
        O extends object | EventTarget,
        K extends keyof O
    >(
        obj: O,
        attr: K,
        ...args: (
            [] |
            [string | string[]] |
            [BindKwds<T, O[K]>] |
            [string | string[], BindKwds<T, O[K]>]
        )
    ): void {
        let events: string[] = [];
        let coerce: (TransformFn<T, O[K]>) | null = null;
        let primary: "observable" | "target" = "observable";
        let update_observable: boolean = true
        let update_target: boolean = true
        for (let arg of args.slice(0, 2)) {
            if (Array.isArray(arg)) {
                events.push(...arg);
                continue;
            }
            if (typeof arg === "string") {
                events.push(arg);
                continue;
            }
            if (arg && typeof arg === "object") {
                coerce = get_default(arg, "coerce", null);
                update_observable = get_default(arg, "update_observable", update_observable)
                update_target = get_default(arg, "update_target", update_target)
                primary = get_default(arg, "primary", update_target ? "observable" : "target");
                continue;
            }
        }

        if (update_observable && obj instanceof EventTarget) {
            for (let event of events) {
                obj.addEventListener(event, () => {
                    this.set(obj[attr]);
                })
            }
        }

        if (update_target) {
            this.watch(v => {
                obj[attr] = <O[K]>(coerce ? coerce(v) : v);
            });
        }

        if (primary === "observable") {
            obj[attr] = <O[K]>(coerce ? coerce(this.get()) : this.get());
        }
        else if (primary === "target") {
            this.set(obj[attr]);
        }

    }


    /**
     * Internal method: used by {@link ObservableNetwork} as part of registration
     *
     * @private
     * @param {ObservableNetwork} network
     */
    __register(network: ObservableNetwork): void {
        this.#network = network;
        for (let fn of this.#receivers.values()) {
            this.#network.comm.recv(OBSERVABLE_CHANGE_MSG, fn);
        }
    }


    /**
     * Internal method: used by {@link ObservableNetwork} as part of communication
     *
     * @private
     * @param {ChangeMessage<T>} change
     */
    __recv_change(change: ChangeMessage<T>): void {
        this.set(change.new_value);
    }


    #notify_change(): void {
        const change = create_message<ChangeMessage<T>>({
            data_id: this.#id,
            new_value: this.#value,
        });

        if (this.#remote) {
            this.#network?.send_change(change);
        }
        else {
            this.#network?.notify_change(change);
        }
    }
};
