type Index_t = string | number | symbol;

export function __get_default<V>(dict: { [k: Index_t]: V }, key: Index_t, default_value: V | (() => V)): V {
    if (key in dict) {
        return dict[key];
    }

    if (default_value instanceof Function) {
        return default_value();
    }

    return default_value;
}

export function __set_default<V>(dict: { [k: Index_t]: V }, key: Index_t, default_value: V | (() => V)): V {
    if (key in dict) {
        return dict[key];
    }

    if (default_value instanceof Function) {
        return dict[key] = default_value();
    }

    return dict[key] = default_value;
}

export function __uuid4(): string {
    return (1e7.toString() + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c: any) =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}
