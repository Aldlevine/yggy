import { Observable, ObservableOr } from "../__init__.js";
import { __NodeTree } from "./node_tree.js";
export declare function tmpl(strings: TemplateStringsArray, ...args: any[]): Observable<string>;
export declare function expr(strs: TemplateStringsArray, ...args: ObservableOr<number>[]): Observable<number>;
export declare function html(html_str: ObservableOr<string> | string): Observable<__NodeTree> | __NodeTree;
