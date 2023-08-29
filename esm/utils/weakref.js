export class IterableWeakMap {
    #weak_map = new WeakMap();
    #ref_set = new Set();
    #finalization_group = new FinalizationRegistry(IterableWeakMap.#cleanup);
    static #cleanup({ set, ref }) {
        set.delete(ref);
    }
    constructor(iterable = []) {
        for (const [k, v] of iterable) {
            this.set(k, v);
        }
    }
    set(key, value) {
        const ref = new WeakRef(key);
        this.#weak_map.set(key, { value, ref });
        this.#ref_set.add(ref);
        this.#finalization_group.register(key, {
            set: this.#ref_set,
            ref
        }, ref);
    }
    get(key) {
        const entry = this.#weak_map.get(key);
        return entry && entry.value;
    }
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
    entries() {
        return this[Symbol.iterator]();
    }
    *keys() {
        for (const [k, v] of this) {
            yield k;
        }
    }
    *values() {
        for (const [k, v] of this) {
            yield v;
        }
    }
}
