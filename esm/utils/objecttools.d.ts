/**
 * Map possibly primitive `T` to it's object type.
 *
 * @template T Type specifier.
 */
export type ObjectOf<T> = T extends object ? T : T extends boolean ? Boolean : T extends number ? Number : T extends string ? String : never;
/**
 * Map possibly primitive `p` to it's object form.
 *
 * @template T Input type.
 * @param p Input value.
 * @returns Instance of `ObjectOf<T>`.
 * @throws {Error} If input type `p` can't be handled.
 */
export declare function object_of<T>(p: T): ObjectOf<T>;
