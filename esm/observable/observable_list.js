import { create_message } from "../comm/__init__.js";
import { ObservableBase } from "./observable_base.js";
export class ObservableList extends ObservableBase {
    #list;
    constructor(list, kwds = {}) {
        super(kwds);
        this.#list = Array.from(list);
    }
    static create(list, kwds) {
        return new ObservableList(list, kwds);
    }
    static from_schema(schema) {
        return ObservableList.create(schema.list, { id: schema.data_id, remote: true });
    }
    get list() {
        return Array.from(this.#list);
    }
    append(item) {
        this.#emit_changes({ [this.#list.length]: item }, []);
    }
    pop(index = -1) {
        const item = this.#list[index];
        this.#emit_changes({}, [index]);
        return item;
    }
    extend(items) {
        const start = this.#list.length;
        const inserts = {};
        items.forEach((item, index) => {
            inserts[start + index] = item;
        });
        this.#emit_changes(inserts, []);
    }
    clear() {
        const removes = this.#list.map((v, i) => i);
        this.#emit_changes({}, removes);
    }
    insert(index, item) {
        this.#emit_changes({ [index]: item }, []);
    }
    remove(index) {
        this.#emit_changes({}, [index]);
    }
    map(fn) {
        const list = this.#list.map(fn);
        const result = ObservableList.create(list, { remote: false });
        this.watch(change => {
            const inserts = {};
            for (let index in change.inserts) {
                inserts[index] = fn(change.inserts[index]);
            }
            result.#apply_changes(inserts, change.removes);
            result.#emit_changes(inserts, change.removes, true);
        });
        this.network?.register(result);
        return result;
    }
    // /**
    //  * A {@link TransformFn<any, T>} that coerces any value to {@link T}.
    //  * Defaults to the constructor function of {@link T}.
    //  *
    //  * @type {TransformFn<any, T>}
    //  */
    // coerce: TransformFn<any, T>;
    _handle_change_message(msg) {
        this.#apply_changes(msg.inserts, msg.removes);
    }
    #emit_changes(inserts, removes, local = false) {
        const message = create_message({
            "data_id": this.id,
            "inserts": inserts,
            "removes": removes,
        });
        this._emit_change_message(message, local);
    }
    #apply_changes(inserts, removes) {
        if (removes) {
            removes = removes.map(index => index < 0 ? this.#list.length + index : index);
            for (let index of removes.sort((a, b) => b - a)) {
                this.#list.splice(index, 1);
            }
        }
        if (inserts) {
            for (let index_str in inserts) {
                const item = inserts[index_str];
                let index = Number(index_str);
                if (index < 0) {
                    index += this.#list.length;
                }
                this.#list.splice(index, 0, item);
            }
        }
    }
}
;
