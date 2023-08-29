export declare class IterableWeakMap<K extends object, V> {
    #private;
    constructor(iterable?: [K, V][]);
    set(key: K, value: V): void;
    get(key: K): V | void;
    delete(key: K): boolean;
    [Symbol.iterator](): Generator<[K, V]>;
    entries(): Iterator<[K, V]>;
    keys(): Generator<K>;
    values(): Generator<V>;
}
