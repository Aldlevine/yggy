/** @jsx h */

import type { JSXInternal } from "@preact/src/jsx.js";
import { Model, Observable } from "../__init__.js";

export type PropertiesOf<T> = {
    [P in keyof Omit<T, keyof Model | keyof Observable<any>>]:
    T[P] extends Observable<infer U> | undefined
    ? T[P] | U | undefined
    : T[P] extends Observable<infer U>
    ? T[P] | U
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

export function bind<T>(obs: Observable<T> | T, ...events: string[]): Binding | T {
    if (obs instanceof Observable) {
        return new Binding(obs, ...events);
    }
    return obs;
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
                const text = document.createTextNode(String(child.get()));
                child.watch(() => {
                    text.textContent = child.get();
                });
                element.append(text);
            }
            else if (child instanceof Array) {
                for (let c of child) {
                    element.append(c);
                }
            }
            else {
                const text = document.createTextNode(String(child));
                element.append(text);
            }
        }
    }
    return element;
}
