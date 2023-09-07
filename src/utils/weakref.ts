/**
 * An Iterable WeakMap.
 * @template K - The keys' type, must be an object.
 * @template V - The values' type.
 */
export class IterableWeakMap<K extends object, V> {
    #weak_map: WeakMap<K, { value: V; ref: WeakRef<K>; }> = new WeakMap();
    #ref_set: Set<WeakRef<K>> = new Set();
    #finalization_group: FinalizationRegistry<{ set: Set<WeakRef<K>>; ref: WeakRef<K>; }> = new FinalizationRegistry(IterableWeakMap.#cleanup);

    /**
     * Cleans up references from set.
     */
    static #cleanup({ set, ref }: { set: Set<WeakRef<any>>; ref: WeakRef<any>; }) {
        set.delete(ref);
    }

    /**
     * Constructs an IterableWeakMap instance.
     * @param {[K, V][]} iterable - An array of key-value pairs to initialize the map.
     */
    constructor(iterable: [K, V][] = []) {
        for (const [k, v] of iterable) {
            this.set(k, v);
        }
    }

    /**
    * Sets a key-value pair in the weak map.
    * @param {K} key - The key to add 
    * @param {V} value - The value to add
    */
    set(key: K, value: V): void {
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
    get(key: K): V | void {
        const entry = this.#weak_map.get(key);
        return entry && entry.value;
    }

    /**
     * Deletes a key-value pair by key.
     * @param {K} key - The key to delete.
     * @returns {boolean} True if deletion was successful, false otherwise.
     */
    delete(key: K): boolean {
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
    *[Symbol.iterator](): Generator<[K, V]> {
        for (const ref of this.#ref_set) {
            const key = ref.deref();
            if (!key) { continue; }
            const { value } = this.#weak_map.get(key)!;
            yield [key, value];
        }
    }

    /**
     * Provides an iterator for the entries of the map.
     * @returns {Iterator<[K, V]>} An Iterator for the entries.
     */
    entries(): Iterator<[K, V]> {
        return this[Symbol.iterator]();
    }

    /**
     * Provides a generator that yields keys.
     * @returns {Generator<K>} A Generator of keys.
     */
    *keys(): Generator<K> {
        for (const [k, v] of this) {
            yield k;
        }
    }

    /**
     * Provides a generator that yields values.
     * @returns {Generator<V>} A Generator of values.
     */
    *values(): Generator<V> {
        for (const [k, v] of this) {
            yield v;
        }
    }
}