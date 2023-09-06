import { Observable, ObservableOr } from "../__init__.js";
/**
 * A definition object that tells {@link h} to
 * create the specified binding at render time.
 *
 * @export
 * @template T
 */
export declare class Binding<T> {
    obs: Observable<T>;
    events: string[];
    constructor(obs: Observable<T>, ...events: string[]);
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
export declare function bind<T extends boolean>(obs: ObservableOr<T>, ...events: string[]): Binding<T> | T;
export declare function bind<T extends string>(obs: ObservableOr<T>, ...events: string[]): Binding<T> | T;
export declare function bind<T extends number>(obs: ObservableOr<T>, ...events: string[]): Binding<T> | T;
