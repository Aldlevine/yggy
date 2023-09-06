import { WritableKeys } from "../utils/types.js";

export type __NodeTree = Node | __NodeTree[];

export function __make_node(content: any): __NodeTree {
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

export function* __iter_node(__node: __NodeTree): Generator<Node> {
    if (__node instanceof Node) {
        yield __node;
        return;
    }
    for (let node of __node) {
        yield* __iter_node(node);
    }
}

export function __append_node(__parent: Node, __node: __NodeTree): void {
    if (__node instanceof Node) {
        __parent.appendChild(__node);
        return;
    }
    if (Array.isArray(__node)) {
        __node.forEach(node => __append_node(__parent, node));
        return;
    }
}

export function __remove_node(__node: __NodeTree): void {
    if (__node instanceof Node) {
        __node.parentNode?.removeChild(__node);
        return;
    }
    __node.forEach(__remove_node);
}

export function __first_node(__node: __NodeTree): Node | null {
    if (__node instanceof Node) {
        return __node;
    }
    for (let node of __node) {
        return __first_node(node);
    }
    return null;
}

export function __insert_node(__cur_node: __NodeTree, __new_node: __NodeTree): void {
    const first = __first_node(__cur_node);
    const parent = first?.parentNode;
    for (let node of __iter_node(__new_node)) {
        parent?.insertBefore(node, first);
    }
}

export function __replace_node(__cur_node: __NodeTree, __new_node: __NodeTree): void {
    const placeholder = document.createComment("");
    __insert_node(__cur_node, placeholder);
    __remove_node(__cur_node);
    __insert_node(placeholder, __new_node);
    __remove_node(placeholder);
}

export function __html_to_dom(__html: string): __NodeTree {
    const doc = new DOMParser().parseFromString(`${__html}`, "text/html");
    const result = Array.from(doc.body.childNodes);
    doc.body.innerHTML = "";
    return result;
}

export function __set_property(__node: Element, __property: string, __value: any): void {
    if (typeof __value === "boolean" || typeof __value === "number" || typeof __value === "string") {
        __node.setAttribute(__property, String(__value));
    }
    else {
        __node[__property as WritableKeys<Node>] = __value;
    }
}

