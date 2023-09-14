import { ReceiverFn_t } from "../comm/__init__.js";
import { weakref } from "../utils/__init__.js";
import { BaseChangeMessage } from "./messages.js";
import { ObservableNetwork } from "./observable_network.js";
import { BaseObservableSchema } from "./schema.js";
/**
 * The keywords supported by {@link ObservableBase}
 */
export type ObservableKwds = {
    id?: string;
    remote?: boolean;
    network?: ObservableNetwork;
};
export declare abstract class ObservableBase<Schema_T extends BaseObservableSchema, Message_T extends BaseChangeMessage> {
    #private;
    protected constructor(kwds?: ObservableKwds);
    /**
     * Gets the {@link Observable}'s id
     *
     * @readonly
     */
    get id(): string;
    /**
     * Gets the {@link Observable}'s remote property
     *
     * @readonly
     */
    get remote(): boolean;
    /**
     * Gets the {@link Observable}'s {@link ObservableNetwork}
     *
     * @readonly
     */
    get network(): ObservableNetwork | void;
    /**
     * Gets the {@link Observable}'s {@link ObservableNetwork}
     *
     * @readonly
     */
    get receivers(): weakref.IterableWeakMap<ReceiverFn_t, ReceiverFn_t>;
    /**
     * Watches the observable and calls the callback with its value
     * as the argument when changed.
     *
     * @param {TransformFn<T, any>} fn the callback
     * @see {@link Observable.watch}
     */
    watch(fn: (change: Message_T) => any): void;
    /**
     * Internal method: used by {@link ObservableNetwork} as part of registration
     *
     * @private
     * @param {ObservableNetwork} network
     */
    __register(network: ObservableNetwork): void;
    /**
     * Internal method: used by {@link ObservableNetwork} as part of communication
     *
     * @private
     * @param change
     */
    __recv_change(change: Message_T): void;
    protected _emit_change_message(change: Message_T, local?: boolean): void;
    protected abstract _handle_change_message(msg: Message_T): void;
}
