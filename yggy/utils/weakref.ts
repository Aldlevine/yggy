export class IterableWeakMap<K extends object, V> {
    #weak_map: WeakMap<K, { value: V; ref: WeakRef<K>; }> = new WeakMap();
    #ref_set: Set<WeakRef<K>> = new Set();
    #finalization_group: FinalizationRegistry<{ set: Set<WeakRef<K>>; ref: WeakRef<K>; }> = new FinalizationRegistry(IterableWeakMap.#cleanup);

    static #cleanup({ set, ref }: { set: Set<WeakRef<any>>; ref: WeakRef<any>; }) {
        set.delete(ref);
    }

    constructor(iterable: [K, V][] = []) {
        for (const [k, v] of iterable) {
            this.set(k, v);
        }
    }

    set(key: K, value: V): void {
        const ref = new WeakRef(key);
        this.#weak_map.set(key, { value, ref });
        this.#ref_set.add(ref);
        this.#finalization_group.register(key, {
            set: this.#ref_set,
            ref
        }, ref);
    }

    get(key: K): V | void {
        const entry = this.#weak_map.get(key);
        return entry && entry.value;
    }

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

    *[Symbol.iterator](): Generator<[K, V]> {
        for (const ref of this.#ref_set) {
            const key = ref.deref();
            if (!key) { continue; }
            const { value } = this.#weak_map.get(key)!;
            yield [key, value];
        }
    }

    entries(): Iterator<[K, V]> {
        return this[Symbol.iterator]();
    }

    *keys(): Generator<K> {
        for (const [k, v] of this) {
            yield k;
        }
    }

    *values(): Generator<V> {
        for (const [k, v] of this) {
            yield v;
        }
    }
}
