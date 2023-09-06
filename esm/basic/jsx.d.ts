/** @jsx h */
import type { JSX as JSXInternal } from "preact";
import { Observable, ObservableOr } from "../__init__.js";
export declare class Binding<T> {
    obs: Observable<T>;
    events: string[];
    constructor(obs: Observable<T>, ...events: string[]);
}
type __JSXElement<T> = T | Binding<T> | Observable<T> | {
    [P in keyof T]: __JSXElement<T[P]>;
};
declare global {
    namespace JSX {
        type IntrinsicElements = {
            [K in keyof JSXInternal.IntrinsicElements as K extends string ? K | `svg-${K}` : K]: {
                [K2 in keyof JSXInternal.IntrinsicElements[K] as K2 extends `on${string}` ? Lowercase<K2> : K2]: __JSXElement<JSXInternal.IntrinsicElements[K][K2]>;
            };
        };
    }
}
export declare function bind<T extends boolean>(obs: ObservableOr<T>, ...events: string[]): Binding<T> | T;
export declare function bind<T extends string>(obs: ObservableOr<T>, ...events: string[]): Binding<T> | T;
export declare function bind<T extends number>(obs: ObservableOr<T>, ...events: string[]): Binding<T> | T;
export declare function tmpl(strings: TemplateStringsArray, ...args: any[]): Observable<string>;
export declare function expr(strs: TemplateStringsArray, ...args: ObservableOr<number>[]): Observable<number>;
type __NodeTree = Node | __NodeTree[];
export declare function html(__html: Observable<string> | string): Observable<__NodeTree> | __NodeTree;
export declare function h(name: string | ((...args: any[]) => HTMLElement), attrs?: {
    [key: string]: any;
}, ...children: any): Element;
export {};
