/**
 * Map possibly primitive `p` to it's object form.
 *
 * @template T Input type.
 * @param p Input value.
 * @returns Instance of `ObjectOf<T>`.
 * @throws {Error} If input type `p` can't be handled.
 */
export function object_of(p) {
    if (typeof p === "boolean") {
        // @ts-expect-error
        return new Boolean(p);
    }
    if (typeof p === "number") {
        // @ts-expect-error
        return new Number(p);
    }
    if (typeof p === "string") {
        // @ts-expect-error
        return new String(p);
    }
    if (p && typeof p === "object") {
        // @ts-expect-error
        return p;
    }
    throw new Error(`invalid argumment ${p} for "${object_of.name}"`);
}
