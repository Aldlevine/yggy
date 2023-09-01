/** @jsx h */
import { Observable, get, watch } from "../__init__.js";
import { uuid } from "../utils/__init__.js";
export class Binding {
    obs;
    events;
    constructor(obs, ...events) {
        this.obs = obs;
        this.events = events;
    }
}
export function bind(obs, ...events) {
    if (obs instanceof Observable) {
        return new Binding(obs, ...events);
    }
    return obs;
}
export function tmpl(strings, ...args) {
    let network;
    function render_str() {
        const result = [strings[0]];
        args.forEach((obs, i) => {
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
    const obs = Observable.create(uuid.uuid4(), render_str(), { local: true });
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
const __expr_stanitize_reg = /[^\d.()*/+-\s]/g;
export function expr(strs, ...args) {
    if (__expr_stanitize_reg.test(strs.join(""))) {
        throw new Error(`Invalid expr: "${strs.join("${...}")}"`);
    }
    const body_arr = [`return (`];
    for (let i = 0; i < strs.length; i++) {
        body_arr.push(strs[i]);
        if (i < args.length) {
            body_arr.push(`a[${i}]`);
        }
    }
    body_arr.push(`);`);
    const body = body_arr.join("");
    const fn = new Function("a", body);
    const out = watch(args, () => {
        return fn(args.map(a => get(a)));
    });
    return out;
}
function __make_node(content) {
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
function* __iter_node(__node) {
    if (__node instanceof Node) {
        yield __node;
        return;
    }
    for (let node of __node) {
        yield* __iter_node(node);
    }
}
function __append_node(__parent, __node) {
    if (__node instanceof Node) {
        __parent.appendChild(__node);
        return;
    }
    if (Array.isArray(__node)) {
        __node.forEach(node => __append_node(__parent, node));
        return;
    }
}
function __remove_node(__node) {
    if (__node instanceof Node) {
        __node.parentNode?.removeChild(__node);
        return;
    }
    __node.forEach(__remove_node);
}
function __first_node(__node) {
    if (__node instanceof Node) {
        return __node;
    }
    for (let node of __node) {
        return __first_node(node);
    }
    return null;
}
function __insert_node(__cur_node, __new_node) {
    const first = __first_node(__cur_node);
    const parent = first?.parentNode;
    for (let node of __iter_node(__new_node)) {
        parent?.insertBefore(node, first);
    }
}
function __replace_node(__cur_node, __new_node) {
    const placeholder = document.createComment("");
    __insert_node(__cur_node, placeholder);
    __remove_node(__cur_node);
    __insert_node(placeholder, __new_node);
    __remove_node(placeholder);
}
function __html_to_dom(__html) {
    const doc = new DOMParser().parseFromString(`${__html}`, "text/html");
    const result = Array.from(doc.body.childNodes);
    doc.body.innerHTML = "";
    return result;
}
export function html(__html) {
    if (__html instanceof Observable) {
        return watch([__html], () => __html_to_dom(get(__html)));
    }
    return __html_to_dom(__html);
}
// TODO: This should be less hacky
export function h(name, attrs, ...children) {
    if (name instanceof Function) {
        return name(attrs || {}, ...children);
    }
    let element;
    if (/^svg-/.test(name)) {
        name = name.substring("svg-".length);
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
                    attr.obs.watch(() => { element[key] = attr.obs.get(); });
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
                if (attr instanceof Observable) {
                    element.setAttribute(key, String(attr.get()));
                    attr.watch(() => {
                        element.setAttribute(key, String(attr.get()));
                    });
                }
                else if (attr && typeof attr === "object") {
                    for (let subkey in attr) {
                        const subattr = attr[subkey];
                        element[key][subkey] = get(subattr);
                        if (subattr instanceof Observable) {
                            subattr.watch(() => {
                                element[key][subkey] = get(subattr);
                            });
                        }
                    }
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
