import { Observable, ObservableOr, Primitive } from "../__init__.js";
import type { h } from "./jsx.js";

/**
 * A definition object that tells {@link h} to
 * create the specified binding at render time.
 *
 * @export
 * @template T
 */
export class Binding<T> {
    obs: Observable<T>;
    events: string[];

    constructor(obs: Observable<T>, ...events: string[]) {
        this.obs = obs;
        this.events = events;
    }
}


/**
 * Creates a binding definition.
 * Use in a JSX render call to bind
 * and {@link Element} property / event to
 * an {@link Observable}
 *
 * @export
 * @template T
 * @param {ObservableOr<T>} obs the observable to bind (or a primitive)
 * @param {...string[]} events the events to bind
 * @returns {(Binding<T> | T)} a binding definition for JSX
 * 
 * @example ```tsx
 * ...
 * <input type="text" value={ bind(my_observable, "value", "input") } />
 * ...
 * ```
 */
export function bind<T extends boolean>(obs: ObservableOr<T>, ...events: string[]): Binding<T> | T;
export function bind<T extends string>(obs: ObservableOr<T>, ...events: string[]): Binding<T> | T;
export function bind<T extends number>(obs: ObservableOr<T>, ...events: string[]): Binding<T> | T;
export function bind<T>(obs: ObservableOr<T>, ...events: string[]): T extends Primitive ? Binding<T> | T : never {
    if (Observable.isObservable(obs)) {
        return new Binding(obs, ...events) as (T extends Primitive ? Binding<T> : never);
    }
    return obs as (T extends Primitive ? T : never);
}

