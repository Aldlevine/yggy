/**
 * An Iterable WeakMap.
 * @template K - The keys' type, must be an object.
 * @template V - The values' type.
 */
export declare class IterableWeakMap<K extends object, V> {
    #private;
    /**
     * Constructs an IterableWeakMap instance.
     * @param {[K, V][]} iterable - An array of key-value pairs to initialize the map.
     */
    constructor(iterable?: [K, V][]);
    /**
    * Sets a key-value pair in the weak map.
    * @param {K} key - The key to add
    * @param {V} value - The value to add
    */
    set(key: K, value: V): void;
    /**
     * Retrieves a value by its key.
     * @param {K} key - The key to get.
     * @returns {V | void} The value or undefined if not found.
     */
    get(key: K): V | void;
    /**
     * Deletes a key-value pair by key.
     * @param {K} key - The key to delete.
     * @returns {boolean} True if deletion was successful, false otherwise.
     */
    delete(key: K): boolean;
    /**
     * Provides a generator for iterating over keys and values.
     * @returns {Generator<[K, V]>} A Generator yielding key-value pairs.
     */
    [Symbol.iterator](): Generator<[K, V]>;
    /**
     * Provides an iterator for the entries of the map.
     * @returns {Iterator<[K, V]>} An Iterator for the entries.
     */
    entries(): Iterator<[K, V]>;
    /**
     * Provides a generator that yields keys.
     * @returns {Generator<K>} A Generator of keys.
     */
    keys(): Generator<K>;
    /**
     * Provides a generator that yields values.
     * @returns {Generator<V>} A Generator of values.
     */
    values(): Generator<V>;
}
