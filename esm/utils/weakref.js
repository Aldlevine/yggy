/**
 * An Iterable WeakMap.
 * @template K - The keys' type, must be an object.
 * @template V - The values' type.
 */
export class IterableWeakMap {
    #weak_map = new WeakMap();
    #ref_set = new Set();
    #finalization_group = new FinalizationRegistry(IterableWeakMap.#cleanup);
    /**
     * Cleans up references from set.
     */
    static #cleanup({ set, ref }) {
        set.delete(ref);
    }
    /**
     * Constructs an IterableWeakMap instance.
     * @param {[K, V][]} iterable - An array of key-value pairs to initialize the map.
     */
    constructor(iterable = []) {
        for (const [k, v] of iterable) {
            this.set(k, v);
        }
    }
    /**
    * Sets a key-value pair in the weak map.
    * @param {K} key - The key to add
    * @param {V} value - The value to add
    */
    set(key, value) {
        const ref = new WeakRef(key);
        this.#weak_map.set(key, { value, ref });
        this.#ref_set.add(ref);
        this.#finalization_group.register(key, {
            set: this.#ref_set,
            ref
        }, ref);
    }
    /**
     * Retrieves a value by its key.
     * @param {K} key - The key to get.
     * @returns {V | void} The value or undefined if not found.
     */
    get(key) {
        const entry = this.#weak_map.get(key);
        return entry && entry.value;
    }
    /**
     * Deletes a key-value pair by key.
     * @param {K} key - The key to delete.
     * @returns {boolean} True if deletion was successful, false otherwise.
     */
    delete(key) {
        const entry = this.#weak_map.get(key);
        if (!entry) {
            return false;
        }
        this.#weak_map.delete(key);
        this.#ref_set.delete(entry.ref);
        this.#finalization_group.unregister(entry.ref);
        return true;
    }
    /**
     * Provides a generator for iterating over keys and values.
     * @returns {Generator<[K, V]>} A Generator yielding key-value pairs.
     */
    *[Symbol.iterator]() {
        for (const ref of this.#ref_set) {
            const key = ref.deref();
            if (!key) {
                continue;
            }
            const { value } = this.#weak_map.get(key);
            yield [key, value];
        }
    }
    /**
     * Provides an iterator for the entries of the map.
     * @returns {Iterator<[K, V]>} An Iterator for the entries.
     */
    entries() {
        return this[Symbol.iterator]();
    }
    /**
     * Provides a generator that yields keys.
     * @returns {Generator<K>} A Generator of keys.
     */
    *keys() {
        for (const [k, v] of this) {
            yield k;
        }
    }
    /**
     * Provides a generator that yields values.
     * @returns {Generator<V>} A Generator of values.
     */
    *values() {
        for (const [k, v] of this) {
            yield v;
        }
    }
}
