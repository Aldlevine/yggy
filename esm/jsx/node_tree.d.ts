export type __NodeTree = Node | __NodeTree[];
export declare function __make_node(content: any): __NodeTree;
export declare function __iter_node(__node: __NodeTree): Generator<Node>;
export declare function __append_node(__parent: Node, __node: __NodeTree): void;
export declare function __remove_node(__node: __NodeTree): void;
export declare function __first_node(__node: __NodeTree): Node | null;
export declare function __insert_node(__cur_node: __NodeTree, __new_node: __NodeTree): void;
export declare function __replace_node(__cur_node: __NodeTree, __new_node: __NodeTree): void;
export declare function __html_to_dom(__html: string): __NodeTree;
export declare function __set_property(__node: Element, __property: string, __value: any): void;
