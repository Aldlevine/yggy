type Index_t = string | number | symbol;
export declare function get_default<V>(dict: {
    [k: Index_t]: V;
}, key: Index_t, default_value: V | (() => V)): V;
export declare function set_default<V>(dict: {
    [k: Index_t]: V;
}, key: Index_t, default_value: V | (() => V)): V;
export {};
