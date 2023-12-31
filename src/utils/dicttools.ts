type Index_t = string | number | symbol;

export function get_default<
    T extends { [key: string]: any },
    K extends keyof T,
    R = Exclude<T[K], undefined>
>(dict: T, key: K, default_value: R | (() => R)): Exclude<T[K], undefined> | R {
    if (key in dict) {
        return dict[key];
    }

    if (default_value instanceof Function) {
        return default_value();
    }

    return default_value;
}

export function set_default<V>(dict: { [k: Index_t]: V; }, key: Index_t, default_value: V | (() => V)): V {
    if (key in dict) {
        return dict[key];
    }

    if (default_value instanceof Function) {
        return dict[key] = default_value();
    }

    return dict[key] = default_value;
}

