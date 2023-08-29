/** @jsx h */
import type { JSX as JSXInternal } from "preact";
import { Model, Observable } from "../__init__.js";
export type PropertiesOf<T> = {
    [P in keyof Omit<T, keyof Model | keyof Observable<any>>]: T[P] extends Observable<infer U> ? T[P] | U : T[P] extends Observable<infer U> | undefined ? T[P] | U | undefined : T[P];
};
export type ValuesOf<T> = {
    [P in keyof T]: T[P] extends Observable<infer U> | infer U ? U : T[P];
};
export declare class Binding {
    obs: Observable<any>;
    events: string[];
    constructor(obs: Observable<any>, ...events: string[]);
}
type __JSXElement<T> = T | Binding | Observable<T>;
declare global {
    namespace JSX {
        type IntrinsicElements = {
            [K in keyof JSXInternal.IntrinsicElements as K extends string ? K | `svg-${K}` : K]: {
                [K2 in keyof JSXInternal.IntrinsicElements[K]]: __JSXElement<JSXInternal.IntrinsicElements[K][K2]>;
            };
        };
    }
}
export declare function bind<T>(obs: Observable<T> | T, ...events: string[]): Binding | T;
export declare function tmpl(strings: TemplateStringsArray, ...args: any[]): Observable<string>;
type __NodeTree = Node | __NodeTree[];
export declare function html(__html: Observable<string> | string): Observable<__NodeTree> | __NodeTree;
export declare function h(name: string | ((...args: any[]) => HTMLElement), attrs?: {
    [key: string]: any;
}, ...children: any): Element;
export {};