import { create_message } from "../comm/__init__.js";
import { ListChangeMessage } from "./messages.js";
import { ObservableBase, ObservableKwds } from "./observable_base.js";
import { ObservableListSchema } from "./schema.js";


export class ObservableList<T> extends ObservableBase<ObservableListSchema<T>, ListChangeMessage<T>> {
    #list: T[]

    private constructor(list: T[], kwds: ObservableKwds = {}) {
        super(kwds);
        this.#list = Array.from(list);
    }


    static create<T>(list: T[], kwds?: ObservableKwds): ObservableList<T> {
        return new ObservableList(list, kwds);
    }

    static from_schema<T>(schema: ObservableListSchema<T>): ObservableList<T> {
        return ObservableList.create(schema.list, { id: schema.data_id, remote: true });
    }

    get list(): readonly T[] {
        return Array.from(this.#list);
    }

    append(item: T): void {
        this.#emit_changes({ [this.#list.length]: item }, []);
    }

    pop(index: number = -1): T {
        const item = this.#list[index];
        this.#emit_changes({}, [index]);
        return item;
    }

    extend(items: T[]): void {
        const start = this.#list.length;
        const inserts: { [index: number]: T } = {};
        items.forEach((item, index) => {
            inserts[start + index] = item;
        });
        this.#emit_changes(inserts, []);
    }

    clear(): void {
        const removes = this.#list.map((v, i) => i);
        this.#emit_changes({}, removes);
    }

    insert(index: number, item: T): void {
        this.#emit_changes({ [index]: item }, []);
    }

    remove(index: number): void {
        this.#emit_changes({}, [index]);
    }

    map<R>(fn: (v: T) => R): ObservableList<R> {
        const list = this.#list.map(fn);
        const result = ObservableList.create(list, { remote: false });
        this.watch(change => {
            const inserts: { [index: number]: R } = {};
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


    protected _handle_change_message(msg: ListChangeMessage<T>): void {
        this.#apply_changes(msg.inserts, msg.removes);
    }

    #emit_changes(
        inserts: { [index: number]: T },
        removes: number[],
        local: boolean = false,
    ): void {
        const message = create_message<ListChangeMessage<T>>(
            {
                "data_id": this.id,
                "inserts": inserts,
                "removes": removes,
            },
        )
        this._emit_change_message(message, local);
    }

    #apply_changes(
        inserts?: { [index: number]: T },
        removes?: number[],
    ): void {
        if (removes) {
            removes = removes.map(
                index => index < 0 ? this.#list.length + index : index
            );
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

};

