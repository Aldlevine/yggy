/** @jsx h */

import { Observable } from "../__init__.js";
import { Binding } from "./binding.js";
import { __NodeTree, __make_node, __replace_node, __append_node } from "./node_tree.js";
import { __set_property } from "./node_tree.js";

const SVG_PREFIX = "__svg__";

type JSXAttributeTypeMap<T> =
    T extends string ? boolean | number | string :
    T extends SVGAnimatedNumber ? number | string :
    T extends SVGAnimatedLength ? number | string :
    T extends SVGAnimatedEnumeration ? string :
    T extends SVGAnimatedNumberList ? string :
    T extends SVGFEColorMatrixElement ? string :
    T extends SVGFEMorphologyElement ? string :
    T;

type JSXAttribute<
    T, U = JSXAttributeTypeMap<T>
> = U | Binding<U> | Observable<U>;

type JSXAttributeKeyMap<T> =
    T extends "className" ? "class" :
    T extends "htmlFor" ? "for" :
    T extends `${infer U}${"X" | "Y"}` ? U :
    T

type JSXAttributeKeyTypeMap<T, K extends keyof T> =
    K extends "children" ? (
        JSXElement<any> | JSXElement<any>[] | string
    )
    : K extends "style" ? (
        JSXAttribute<string> | { [P in keyof CSSStyleDeclaration]?: JSXAttribute<CSSStyleDeclaration[P]> }
    )
    : JSXAttribute<T[K]>


type JSXElement<T> = {
    [K in keyof T as JSXAttributeKeyMap<K>]?: JSXAttributeKeyTypeMap<T, K>;
}

type HTMLElements = {
    [K in keyof HTMLElementTagNameMap]: JSXElement<HTMLElementTagNameMap[K]>
}

type SVGElements = {
    [K in keyof SVGElementTagNameMap]: JSXElement<SVGElementTagNameMap[K]>
}

type __IntrinsicElements = HTMLElements & SVGElements;


declare global {
    namespace JSX {
        type IntrinsicElements = __IntrinsicElements;
    }
}

type SVGProxy = {
    [P in keyof SVGElements]: P
}

export const svg = new Proxy<SVGProxy>({} as SVGProxy, {
    get<T extends keyof SVGElements>(_: any, p: T): T {
        return `${SVG_PREFIX}${p}` as T;
    },
});


// TODO: This should be less hacky
export function h(name: string | ((...args: any[]) => HTMLElement), attrs?: { [key: string]: any }, ...children: any): Element {
    if (name instanceof Function) {
        return name(attrs || {}, ...children);
    }

    let element: Element & { [key: string]: any };
    if (name.startsWith(SVG_PREFIX)) {
        name = name.substring(SVG_PREFIX.length);
        element = document.createElementNS("http://www.w3.org/2000/svg", name)
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
                    __set_property(element, key, attr.obs)
                }
            }
            else {
                if (Observable.is_observable(attr)) {
                    __set_property(element, key, attr.get());
                    attr.watch(v => {
                        __set_property(element, key, v);
                    });
                }
                else if (attr && typeof attr === "object") {
                    for (let subkey in attr) {
                        const subattr = attr[subkey];
                        element[key][subkey] = Observable.get(subattr);
                        if (Observable.is_observable(subattr)) {
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
            else if (Observable.is_observable(child)) {
                const value = child.get();
                ((node: __NodeTree) => {
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