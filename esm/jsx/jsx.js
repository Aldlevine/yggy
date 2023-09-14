/** @jsx h */
import { Observable, ObservableList } from "../__init__.js";
import { Binding } from "./binding.js";
import { __append_node, __insert_node, __make_node, __remove_node, __replace_node, __set_property } from "./node_tree.js";
const SVG_PREFIX = "__svg__";
export const svg = new Proxy({}, {
    get(_, p) {
        return `${SVG_PREFIX}${p}`;
    },
});
// TODO: This should be less hacky
export function h(name, attrs, ...children) {
    if (name instanceof Function) {
        return name(attrs || {}, ...children);
    }
    let element;
    if (name.startsWith(SVG_PREFIX)) {
        name = name.substring(SVG_PREFIX.length);
        element = document.createElementNS("http://www.w3.org/2000/svg", name);
    }
    else {
        element = document.createElement(name);
    }
    if (attrs) {
        for (let key in attrs) {
            const attr = attrs[key];
            if (attr instanceof Binding) {
                if (attr.obs instanceof Observable) {
                    attr.obs.bind(element, key, attr.events);
                }
                else {
                    __set_property(element, key, attr.obs);
                }
            }
            else {
                if (Observable.is_observable(attr)) {
                    __set_property(element, key, attr.get());
                    attr.watch(change => {
                        __set_property(element, key, change.new_value);
                    });
                }
                else if (attr && typeof attr === "object") {
                    for (let subkey in attr) {
                        const subattr = attr[subkey];
                        element[key][subkey] = Observable.get(subattr);
                        if (Observable.is_observable(subattr)) {
                            subattr.watch(change => {
                                element[key][subkey] = change.new_value;
                            });
                        }
                    }
                }
                else {
                    __set_property(element, key, attrs[key]);
                }
            }
        }
    }
    if (children) {
        for (let child of children) {
            if (child instanceof Element) {
                element.appendChild(child);
            }
            else if (child instanceof ObservableList) {
                const nodes = [];
                for (let item of child.list) {
                    const node = __make_node(item);
                    __append_node(element, node);
                    nodes.push(node);
                }
                child.watch(change => {
                    for (let index of change.removes) {
                        if (index < 0) {
                            index = nodes.length + index;
                        }
                        __remove_node(nodes[index]);
                        nodes.splice(index, 1);
                    }
                    for (let index_str in change.inserts) {
                        let index = Number(index_str);
                        const item = change.inserts[index];
                        const node = __make_node(item);
                        if (index < 0) {
                            index = nodes.length + index;
                        }
                        if (index < nodes.length - 1) {
                            __insert_node(nodes[index], node);
                            nodes.splice(index, 0, node);
                        }
                        else {
                            __append_node(element, node);
                            nodes.push(node);
                        }
                    }
                });
            }
            else if (Observable.is_observable(child)) {
                const value = child.get();
                ((node) => {
                    child.watch(() => {
                        const old_node = node;
                        node = __make_node(child.get());
                        __replace_node(old_node, node);
                    });
                    __append_node(element, node);
                })(__make_node(value));
            }
            else if (child instanceof Array) {
                for (let c of child) {
                    __append_node(element, __make_node(c));
                }
            }
            else {
                __append_node(element, __make_node(child));
            }
        }
    }
    return element;
}
