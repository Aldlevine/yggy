/** @jsx h */

import type { JSX as JSXInternal } from "preact";
import { Model, Observable, ObservableNetwork, get, watch } from "../__init__.js";
import { uuid } from "../utils/__init__.js";

export type PropertiesOf<T> = {
    [P in keyof Omit<T, keyof Model | keyof Observable<any>>]:
    T[P] extends Observable<infer U>
    ? T[P] | U
    : T[P] extends Observable<infer U> | undefined
    ? T[P] | U | undefined
    : T[P];
}

export type ValuesOf<T> = {
    [P in keyof T]: T[P] extends Observable<infer U> | infer U ? U : T[P]
}


export class Binding {
    obs: Observable<any>;
    events: string[];

    constructor(obs: Observable<any>, ...events: string[]) {
        this.obs = obs;
        this.events = events;
    }
}


type __JSXElement<T> = T | Binding | Observable<T>

declare global {
    namespace JSX {
        type IntrinsicElements = {
            [K in keyof JSXInternal.IntrinsicElements as K extends string ? K | `svg-${K}` : K]: {
                [K2 in keyof JSXInternal.IntrinsicElements[K]]: __JSXElement<JSXInternal.IntrinsicElements[K][K2]>
            }
        }
    }
}

export function bind<T>(obs: Observable<T> | T, ...events: string[]): Binding | T {
    if (obs instanceof Observable) {
        return new Binding(obs, ...events);
    }
    return obs;
}

export function tmpl(strings: TemplateStringsArray, ...args: any[]): Observable<string> {
    let network!: ObservableNetwork;
    function render_str(): string {
        const result: string[] = [];
        args.forEach((obs: any, i: number) => {
            if (obs instanceof Observable) {
                if (obs.network) {
                    network = obs.network;
                }
                result.push(String(obs.get()), strings[i + 1]);
            }
            else {
                result.push(String(obs), strings[i + 1]);
            }
        });
        return result.join("");
    }

    const obs = new Observable(uuid.uuid4(), render_str(), { local: true });
    if (network) {
        network.register(obs);
    }

    for (let arg of args) {
        if (arg instanceof Observable) {
            arg.watch(() => {
                obs.set(render_str());
            });
        }
    }

    return obs;
}

type __NodeTree = Node | __NodeTree[];

function __make_node(content: any): __NodeTree {
    if (content instanceof Node) {
        return content;
    }
    else if (Array.isArray(content)) {
        return content.map(__make_node);
    }
    else {
        return document.createTextNode(content);
    }
}

function* __iter_node(__node: __NodeTree): Generator<Node> {
    if (__node instanceof Node) {
        yield __node;
        return;
    }
    for (let node of __node) {
        yield* __iter_node(node);
    }
}

function __append_node(__parent: Node, __node: __NodeTree): void {
    if (__node instanceof Node) {
        __parent.appendChild(__node);
        return;
    }
    if (Array.isArray(__node)) {
        __node.forEach(node => __append_node(__parent, node));
        return;
    }
}

function __remove_node(__node: __NodeTree): void {
    if (__node instanceof Node) {
        __node.parentNode?.removeChild(__node);
        return;
    }
    __node.forEach(__remove_node);
}

function __first_node(__node: __NodeTree): Node | null {
    if (__node instanceof Node) {
        return __node;
    }
    for (let node of __node) {
        return __first_node(node);
    }
    return null
}

function __insert_node(__cur_node: __NodeTree, __new_node: __NodeTree): void {
    const first = __first_node(__cur_node);
    const parent = first?.parentNode;
    for (let node of __iter_node(__new_node)) {
        parent?.insertBefore(node, first);
    }
}

function __replace_node(__cur_node: __NodeTree, __new_node: __NodeTree): void {
    const placeholder = document.createComment("");
    __insert_node(__cur_node, placeholder);
    __remove_node(__cur_node);
    __insert_node(placeholder, __new_node);
    __remove_node(placeholder);
}

function __html_to_dom(__html: string): __NodeTree {
    const doc = new DOMParser().parseFromString(`${__html}`, "text/html");
    const result = Array.from(doc.body.childNodes);
    doc.body.innerHTML = "";
    return result;
}

export function html(__html: Observable<string> | string): Observable<__NodeTree> | __NodeTree {
    if (__html instanceof Observable) {
        return watch([__html], () => __html_to_dom(get(__html)));
    }
    return __html_to_dom(__html);
}

// TODO: This should be less hacky
export function h(name: string | ((...args: any[]) => HTMLElement), attrs?: { [key: string]: any }, ...children: any): Element {
    if (name instanceof Function) {
        return name(attrs || {}, ...children);
    }

    let element: Element & { [key: string]: any };
    if (/^svg-/.test(name)) {
        name = name.substring("svg-".length);
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
                    attr.obs.watch(() => { element[key] = attr.obs.get(); })
                    element[key] = attr.obs.get();
                    if (attr.events) {
                        for (let evt of attr.events) {
                            element.addEventListener(evt, () => { attr.obs.set(element[key]); });
                        }
                    }
                }
                else {
                    element[key] = String(attr.obs);
                }
            }
            else {
                const attr = attrs[key];
                if (attr instanceof Observable) {
                    element.setAttribute(key, String(attr.get()));
                    attr.watch(() => {
                        element.setAttribute(key, String(attr.get()));
                    });
                }
                else {
                    element.setAttribute(key, String(attrs[key]));
                }
            }
        }
    }

    if (children) {
        for (let child of children) {
            if (child instanceof Element) {
                element.appendChild(child);
            }
            else if (child instanceof Observable) {
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
