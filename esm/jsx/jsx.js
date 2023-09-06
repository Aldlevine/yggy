/** @jsx h */
import { Observable } from "../__init__.js";
import { Binding } from "./binding.js";
import { __make_node, __replace_node, __append_node } from "./node_tree.js";
import { __set_property } from "./node_tree.js";
const SVG_PREFIX = "svg.";
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
                if (Observable.isObservable(attr)) {
                    __set_property(element, key, attr.get());
                    attr.watch(v => {
                        __set_property(element, key, v);
                    });
                }
                else if (attr && typeof attr === "object") {
                    for (let subkey in attr) {
                        const subattr = attr[subkey];
                        element[key][subkey] = Observable.getValue(subattr);
                        if (Observable.isObservable(subattr)) {
                            subattr.watch(v => {
                                element[key][subkey] = v;
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
            else if (Observable.isObservable(child)) {
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
