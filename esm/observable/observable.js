import { create_message } from "../comm/__init__.js";
import { weakref } from "../utils/__init__.js";
import { get_default } from "../utils/dicttools.js";
import { uuid4 } from "../utils/uuid.js";
import { OBSERVABLE_CHANGE_MSG } from "./messages.js";
/**
 * Gets the constructor function for a given {@link Primitive}
 *
 * @template T
 * @param {T} v the primitive
 * @returns {ConstructorOf<T>}
 */
function ctorOf(v) {
    if (typeof v === "boolean") {
        return Boolean;
    }
    if (typeof v === "number") {
        return Number;
    }
    if (typeof v === "string") {
        return String;
    }
}
/**
 * The static components of the {@link Observable} constructor
 */
class ObservableStatic {
    static isObservable(o, type) {
        if (!(o instanceof _Observable)) {
            return false;
        }
        if (type === Boolean) {
            return typeof o.get() === "boolean";
        }
        if (type === Number) {
            return typeof o.get() === "number";
        }
        if (type === String) {
            return typeof o.get() === "string";
        }
        return !type || o.get() instanceof type;
    }
    /**
     * Safely gets a value from an {@link Observable} or {@link Primitive}
     *
     * @static
     * @template T
     * @param {ObservableOr<T>} o an {@link Observable} or {@link Primitive}
     * @returns {T} the value
     */
    static getValue(o) {
        if (ObservableStatic.isObservable(o)) {
            return o.get();
        }
        return o;
    }
    /**
     * Same as {@link getValue} but applies to a tuple / array. tuple / array may be heterogeneous.
     *
     * @static
     * @template T
     * @param {...ObservableOrTuple<T>} os the {@link Observable}s and or {@link Primitive}s to get the values of.
     * @returns {T} a tuple of values
     */
    static getAllValues(...os) {
        return os.map(ObservableStatic.getValue);
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
    static watch(...args) {
        const fn = args.pop();
        const args_ = args;
        const handler = () => {
            fn.call(null, ...Observable.getAllValues(...args_));
        };
        for (let o of args_) {
            if (Observable.isObservable(o)) {
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
    static map(...args) {
        const fn = args.pop();
        const args_ = args;
        const value = fn.call(null, ...Observable.getAllValues(...args_));
        const result = new Observable(value);
        ObservableStatic.watch(...args_, (...values) => {
            const value = fn.call(null, ...values);
            result.set(value);
        });
        let network = null;
        for (let o of args_) {
            if (Observable.isObservable(o) && o.network) {
                network = o.network;
                break;
            }
        }
        if (network) {
            network.register(result);
        }
        return result;
    }
    static from_schema(__schema) {
        return new Observable(__schema.value, { id: __schema.data_id, remote: true });
    }
}
/**
 * @param {T} v the initial value
 * @returns {Observable<T>} the observable
 */
export const Observable = function (v, kwds) {
    return _Observable.create(v, kwds);
};
/** apply {@link ObservableStatic} to {@link Observable} */
for (let key of Object.getOwnPropertyNames(ObservableStatic)) {
    Object.defineProperty(Observable, key, {
        value: ObservableStatic[key]
    });
}
Object.defineProperty(Observable, Symbol.hasInstance, {
    value: (o) => o instanceof _Observable
});
/**
 * A {@link ProxyHandler} that either forwards directly to {@link _Observable}
 * OR to a wrapper around the underlying {@link Primitive}'s method / accessor
 * which returns an {@link Observable} which reevaluates whenever the parent
 * {@link Observable}(s) change.
 *
 * @implements {ProxyHandler<_Observable<T>>}
 */
class _ObservableProxyHandler {
    static get(target, p, _receiver) {
        const value = target.get();
        if (value !== null && value !== undefined) {
            const attr = value[p];
            if (typeof attr === "function") {
                return (...args) => {
                    const observables = [target, ...args.filter(Observable.isObservable)];
                    const value = attr.apply(target.get(), Observable.getAllValues(...args));
                    const result = Observable(value);
                    Observable.watch(...observables, (..._) => {
                        result.set(attr.call(target.get(), ...Observable.getAllValues(...args)));
                    });
                    target.network?.register(result);
                    return result;
                };
            }
            else if (attr !== undefined) {
                return target.map(v => v[p]);
            }
        }
        const attr = target[p];
        if (typeof attr === "function") {
            return attr.bind(target);
        }
        return target[p];
    }
    static set(target, p, value, _receiver) {
        const desc = Object.getOwnPropertyDescriptor(target, p);
        if (desc?.set) {
            desc.set.call(target, value);
        }
        else {
            target[p] = value;
        }
        return true;
    }
}
/**
 * The actual {@link Observable} implementation.
 * Because we are using {@link Proxy}, we need to
 * separate the public type / constructor ({@link Observable})
 * from the internal implementation ({@link _Observable})
 *
 * @template T
 */
class _Observable {
    #value;
    #id;
    #remote;
    #network;
    #receivers;
    /**
     * Creates an instance of {@link _Observable}.
     * Private because {@link create} is required for correct typing with {@link Observable}.
     *
     * @constructor
     * @private
     * @param {T} value
     */
    constructor(value, kwds = {}) {
        this.#value = value;
        this.#id = get_default(kwds, "id", uuid4());
        this.#remote = get_default(kwds, "remote", false);
        this.#network = get_default(kwds, "network", undefined);
        this.#receivers = new weakref.IterableWeakMap();
        const defaultCoerce = ctorOf(this.get());
        if (defaultCoerce) {
            this.coerce = (v) => defaultCoerce(v);
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
    static create(value, kwds) {
        return new Proxy(new _Observable(value, kwds), _ObservableProxyHandler);
    }
    /**
     * Gets the {@link Observable}'s id
     *
     * @readonly
     */
    get id() {
        return this.#id;
    }
    /**
     * Gets the {@link Observable}'s {@link ObservableNetwork}
     *
     * @readonly
     */
    get network() {
        return this.#network;
    }
    /**
     * Gets the {@link Observable}'s value.
     *
     * @returns {T}
     */
    get() {
        return this.#value;
    }
    /**
     * Sets the {@link Observable}'s value.
     * Emits a change event if {@link coerce}({@link v}) !== {@link get}()
     *
     * @param {*} v
     */
    set(v) {
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
    coerce;
    /**
     * Watches the observable and calls the callback with its value
     * as the argument when changed.
     *
     * @param {TransformFn<T, any>} fn the callback
     * @see {@link Observable.watch}
     */
    watch(fn) {
        const __recv_change = (__change) => {
            if (__change["data_id"] != this.id) {
                return;
            }
            fn(__change.new_value);
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
    map(fn) {
        const result = _Observable.create(fn(this.get()));
        this.watch(v => {
            result.set(fn(v));
        });
        if (this.#network) {
            this.#network.register(result);
        }
        return result;
    }
    bind(obj, attr, ...args) {
        let events = [];
        let coerce = null;
        let primary = "observable";
        let update_observable = true;
        let update_target = true;
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
                update_observable = get_default(arg, "update_observable", update_observable);
                update_target = get_default(arg, "update_target", update_target);
                primary = get_default(arg, "primary", update_target ? "observable" : "target");
                continue;
            }
        }
        if (update_observable && obj instanceof EventTarget) {
            for (let event of events) {
                obj.addEventListener(event, () => {
                    this.set(obj[attr]);
                });
            }
        }
        if (update_target) {
            this.watch(v => {
                obj[attr] = (coerce ? coerce(v) : v);
            });
        }
        if (primary === "observable") {
            obj[attr] = (coerce ? coerce(this.get()) : this.get());
        }
        else if (primary === "target") {
            this.set(obj[attr]);
        }
    }
    /**
     * Internal method: used by {@link ObservableNetwork} as part of registration
     *
     * @private
     * @param {ObservableNetwork} __network
     */
    __register(__network) {
        this.#network = __network;
        for (let fn of this.#receivers.values()) {
            this.#network.comm.recv(OBSERVABLE_CHANGE_MSG, fn);
        }
    }
    /**
     * Internal method: used by {@link ObservableNetwork} as part of communication
     *
     * @private
     * @param {ObservableNetwork} __network
     */
    __recv_change(change) {
        this.set(change.new_value);
    }
    #notify_change() {
        const change = create_message({
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
}
;
