type Index_t = string | number | symbol;
export declare function get_default<T extends {
    [key: string]: any;
}, K extends keyof T, R = Exclude<T[K], undefined>>(dict: T, key: K, default_value: R | (() => R)): Exclude<T[K], undefined> | R;
export declare function set_default<V>(dict: {
    [k: Index_t]: V;
}, key: Index_t, default_value: V | (() => V)): V;
export {};
