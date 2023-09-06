/** @jsx h */

import type { JSX as JSXInternal } from "preact";
import { Observable, ObservableNetwork, ObservableOr, Primitive } from "../__init__.js";
import { uuid } from "../utils/__init__.js";


export class Binding<T> {
    obs: Observable<T>;
    events: string[];

    constructor(obs: Observable<T>, ...events: string[]) {
        this.obs = obs;
        this.events = events;
    }
}

type __JSXElement<T> = T | Binding<T> | Observable<T> | { [P in keyof T]: __JSXElement<T[P]> };
// type __JSXElement<T> = T | { [P in keyof T]: __JSXElement<T[P]> } | (T extends Primitive ? Observable<T> | Binding<T> : never);

declare global {
    namespace JSX {
        type IntrinsicElements = {
            [
            K in keyof JSXInternal.IntrinsicElements
            as K extends string ? K | `svg-${K}` : K
            ]: {
                [
                K2 in keyof JSXInternal.IntrinsicElements[K]
                as K2 extends `on${string}` ? Lowercase<K2> : K2
                ]:
                __JSXElement<JSXInternal.IntrinsicElements[K][K2]>
            }
        }
    }
}

export function bind<T extends boolean>(obs: ObservableOr<T>, ...events: string[]): Binding<T> | T;
export function bind<T extends string>(obs: ObservableOr<T>, ...events: string[]): Binding<T> | T;
export function bind<T extends number>(obs: ObservableOr<T>, ...events: string[]): Binding<T> | T;
export function bind<T>(obs: ObservableOr<T>, ...events: string[]): T extends Primitive ? Binding<T> | T : never {
    if (Observable.isObservable(obs)) {
        return new Binding(obs, ...events) as (T extends Primitive ? Binding<T> : never);
    }
    return obs as (T extends Primitive ? T : never);
}

export function tmpl(strings: TemplateStringsArray, ...args: any[]): Observable<string> {
    let network!: ObservableNetwork;
    function render_str(): string {
        const result: string[] = [strings[0]];
        args.forEach((obs: any, i: number) => {
            if (Observable.isObservable(obs)) {
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

    const obs = new Observable(render_str(), { id: uuid.uuid4(), remote: false });
    if (network) {
        network.register(obs as unknown as Observable<any>);
    }

    for (let arg of args) {
        if (Observable.isObservable(arg)) {
            arg.watch(() => {
                obs.set(render_str());
            });
        }
    }

    return obs;
}

const __expr_stanitize_reg = /[^\d.()*/+-\s]/g;
export function expr(strs: TemplateStringsArray, ...args: ObservableOr<number>[]): Observable<number> {
    if (__expr_stanitize_reg.test(strs.join(""))) {
        throw new Error(`Invalid expr: "${strs.join("${...}")}"`)
    }
    const body_arr: string[] = [`return (`];
    for (let i = 0; i < strs.length; i++) {
        body_arr.push(strs[i]);
        if (i < args.length) {
            body_arr.push(`a[${i}]`)
        }
    }
    body_arr.push(`);`);
    const body = body_arr.join("");
    const fn = new Function("a", body);
    const out = Observable.map(...args, (...args_: number[]) => {
        const result = <number>fn(args_);
        return result;
    });
    return out;
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

type IfEquals<X, Y, A = X, B = never> =
    (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? A : B;

type WritableKeys<T> = {
    [P in keyof T]-?: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P>
}[keyof T];

function __set_property(__node: Element, __property: string, __value: any): void {
    if (typeof __value === "boolean" || typeof __value === "number" || typeof __value === "string") {
        __node.setAttribute(__property, String(__value));
    }
    else {
        __node[__property as WritableKeys<Node>] = __value;
    }
}

export function html(__html: Observable<string> | string): Observable<__NodeTree> | __NodeTree {
    if (Observable.isObservable(__html)) {
        const obs = Observable.map(__html, (h) => __html_to_dom(h));
        obs.coerce = (x) => x;
        return obs;
    }
    return __html_to_dom(<string>__html);
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
                    attr.obs.bind(element, key, attr.events);
                }
                else {
                    __set_property(element, key, attr.obs)
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
