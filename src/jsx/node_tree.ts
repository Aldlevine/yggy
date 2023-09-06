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

export function* __iter_node(root_node: __NodeTree): Generator<Node> {
    if (root_node instanceof Node) {
        yield root_node;
        return;
    }
    for (let node of root_node) {
        yield* __iter_node(node);
    }
}

export function __append_node(parent: Node, node: __NodeTree): void {
    if (node instanceof Node) {
        parent.appendChild(node);
        return;
    }
    if (Array.isArray(node)) {
        node.forEach(node => __append_node(parent, node));
        return;
    }
}

export function __remove_node(node: __NodeTree): void {
    if (node instanceof Node) {
        node.parentNode?.removeChild(node);
        return;
    }
    node.forEach(__remove_node);
}

export function __first_node(parent_node: __NodeTree): Node | null {
    if (parent_node instanceof Node) {
        return parent_node;
    }
    for (let node of parent_node) {
        return __first_node(node);
    }
    return null;
}

export function __insert_node(cur_node: __NodeTree, new_node: __NodeTree): void {
    const first = __first_node(cur_node);
    const parent = first?.parentNode;
    for (let node of __iter_node(new_node)) {
        parent?.insertBefore(node, first);
    }
}

export function __replace_node(cur_node: __NodeTree, new_node: __NodeTree): void {
    const placeholder = document.createComment("");
    __insert_node(cur_node, placeholder);
    __remove_node(cur_node);
    __insert_node(placeholder, new_node);
    __remove_node(placeholder);
}

export function __html_to_dom(html: string): __NodeTree {
    const doc = new DOMParser().parseFromString(`${html}`, "text/html");
    const result = Array.from(doc.body.childNodes);
    doc.body.innerHTML = "";
    return result;
}

export function __set_property(node: Element, property: string, value: any): void {
    if (typeof value === "boolean" || typeof value === "number" || typeof value === "string") {
        node.setAttribute(property, String(value));
    }
    else {
        node[property as WritableKeys<Node>] = value;
    }
}

