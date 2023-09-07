/**
 * Function to get a default value from a dictionary if the key isn't present or is `undefined`
 * @template T extends { [key: string]: any }
 * @template K extends keyof T
 * @template R - Type of the return, excludes `undefined` from possible types of T[K]
 * @param {T} dict - The dictionary to extract value from.
 * @param {K} key - The key to look up in the dictionary.
 * @param {R | (() => R)} default_value - The default value to return if key isn't found or is `undefined`.
 * @returns {Exclude<T[K], undefined> | R} - Returns the value from the dictionary or the default value.
 */
export function get_default(dict, key, default_value) {
    if (key in dict) {
        return dict[key];
    }
    if (default_value instanceof Function) {
        return default_value();
    }
    return default_value;
}
/**
 * Function to set a default value in a dictionary if the key isn't present
 * @template V - Type of the values in the dictionary.
 * @param {{ [k: Index_t]: V; }} dict - The dictionary to set the value in.
 * @param {Index_t} key - The key in the dictionary.
 * @param {V | (() => V)} default_value - The default value to set if key isn't found.
 * @returns {V} - Returns the value set in the dictionary.
 */
export function set_default(dict, key, default_value) {
    if (key in dict) {
        return dict[key];
    }
    if (default_value instanceof Function) {
        return dict[key] = default_value();
    }
    return dict[key] = default_value;
}
