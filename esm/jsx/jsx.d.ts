/** @jsx h */
import type { JSX as JSXInternal } from "preact";
import { Observable } from "../__init__.js";
import { Binding } from "./binding.js";
type JSXElement<T> = T | Binding<T> | Observable<T> | {
    [P in keyof T]: JSXElement<T[P]>;
};
declare global {
    namespace JSX {
        type IntrinsicElements = {
            [K in keyof JSXInternal.IntrinsicElements]: {
                [K2 in keyof JSXInternal.IntrinsicElements[K] as K2 extends `on${string}` ? Lowercase<K2> : K2]: JSXElement<JSXInternal.IntrinsicElements[K][K2]>;
            };
        };
    }
}
type SVGKeys = keyof SVGElementTagNameMap;
type SVGProxy = {
    [P in SVGKeys]: P;
};
export declare const svg: SVGProxy;
export declare function h(name: string | ((...args: any[]) => HTMLElement), attrs?: {
    [key: string]: any;
}, ...children: any): Element;
export {};
