import { ListChangeMessage } from "./messages.js";
import { ObservableBase, ObservableKwds } from "./observable_base.js";
import { ObservableListSchema } from "./schema.js";
export declare class ObservableList<T> extends ObservableBase<ObservableListSchema<T>, ListChangeMessage<T>> {
    #private;
    private constructor();
    static create<T>(list: T[], kwds?: ObservableKwds): ObservableList<T>;
    static from_schema<T>(schema: ObservableListSchema<T>): ObservableList<T>;
    get list(): readonly T[];
    append(item: T): void;
    pop(index?: number): T;
    extend(items: T[]): void;
    clear(): void;
    insert(index: number, item: T): void;
    remove(index: number): void;
    map<R>(fn: (v: T) => R): ObservableList<R>;
    protected _handle_change_message(msg: ListChangeMessage<T>): void;
}
