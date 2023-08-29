export function get_default(dict, key, default_value) {
    if (key in dict) {
        return dict[key];
    }
    if (default_value instanceof Function) {
        return default_value();
    }
    return default_value;
}
export function set_default(dict, key, default_value) {
    if (key in dict) {
        return dict[key];
    }
    if (default_value instanceof Function) {
        return dict[key] = default_value();
    }
    return dict[key] = default_value;
}
