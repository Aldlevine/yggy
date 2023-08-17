/** @jsx h */

import { ObservableValue } from "../index.js";

interface Binder {
    obs: ObservableValue<any>;
    evt?: string;
}

interface IntrinsicElement {
    [bindName: `bind-${string}`]: Binder;
    [attrName: string]: any;
}

declare global {
    namespace JSX {
        interface Element extends HTMLElement {
            [attrName: string]: any;
        }
        interface IntrinsicElements {
            [elemName: string]: IntrinsicElement;
        }
    }
}

class Binding {
    obs: ObservableValue<any>;
    events: string[];

    constructor(obs: ObservableValue<any>, ...events: string[]) {
        this.obs = obs;
        this.events = events;
    }
}

export function bind(obs: ObservableValue<any> | any, ...events: string[]): Binding {
    return new Binding(obs, ...events);
}

// TODO: This should be less hacky
export function h(name: string | ((...args: any[]) => JSX.Element), attrs?: JSX.Element, ...children: any): JSX.Element {
    if (name instanceof Function) {
        return name(attrs, ...children);
    }
    const element: HTMLElement & { [key: string]: any } = document.createElement(name);

    if (attrs) {
        for (let key in attrs) {
            const attr = attrs[key];
            if (attr instanceof Binding) {
                if (attr.obs instanceof ObservableValue) {
                    attr.obs.watch(() => { element[key] = attr.obs(); })
                    element[key] = attr.obs();
                    if (attr.events) {
                        for (let evt of attr.events) {
                            element.addEventListener(evt, () => { attr.obs(element[key]); });
                        }
                    }
                }
                else {
                    element[key] = String(attr.obs);
                }
            }
            else {
                const attr = attrs[key];
                if (attr instanceof ObservableValue) {
                    element.setAttribute(key, String(attr()));
                    attr.watch(() => {
                        element.setAttribute(key, String(attr()));
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
            else if (child instanceof ObservableValue) {
                const text = document.createTextNode(String(child()));
                child.watch(() => {
                    text.textContent = child();
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
