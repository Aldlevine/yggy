
/**
 * Resolves to 1 if {@link A1} == {@link A2} and 0 otherwise.
 *
 * @export
 * @template A1
 * @template A2
 */
export type Equals<A1 extends any, A2 extends any> =
    (<A>() => A extends A2 ? 1 : 0) extends
    (<A>() => A extends A1 ? 1 : 0)
    ? (
        (<A>() => A extends A1 ? 1 : 0) extends
        (<A>() => A extends A2 ? 1 : 0)
        ? 1 : 0
    ) : 0


/**
 * Resolves a union of writable properties of {@link T}
 *
 * @export
 * @template T
 */
export type WritableKeys<T extends object> = {
    [K in keyof T]-?: {
        1: K
        0: never
    }[Equals<
        { -readonly [Q in K]: T[K] },
        { [Q in K]: T[K] }
    >]
}[keyof T]