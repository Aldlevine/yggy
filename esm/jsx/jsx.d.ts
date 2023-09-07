/** @jsx h */
import { Observable } from "../__init__.js";
import { Binding } from "./binding.js";
type JSXAttributeTypeMap<T> = T extends string ? boolean | number | string : T extends SVGAnimatedNumber ? number | string : T extends SVGAnimatedLength ? number | string : T extends SVGAnimatedEnumeration ? string : T extends SVGAnimatedNumberList ? string : T extends SVGFEColorMatrixElement ? string : T extends SVGFEMorphologyElement ? string : T;
type JSXAttribute<T, U = JSXAttributeTypeMap<T>> = U | Binding<U> | Observable<U>;
type JSXAttributeKeyMap<T> = T extends "className" ? "class" : T extends "htmlFor" ? "for" : T extends `${infer U}${"X" | "Y"}` ? U : T;
type JSXAttributeKeyTypeMap<T, K extends keyof T> = K extends "children" ? (JSXElement<any> | JSXElement<any>[] | string) : K extends "style" ? (JSXAttribute<string> | {
    [P in keyof CSSStyleDeclaration]?: JSXAttribute<CSSStyleDeclaration[P]>;
}) : JSXAttribute<T[K]>;
type JSXElement<T> = {
    [K in keyof T as JSXAttributeKeyMap<K>]?: JSXAttributeKeyTypeMap<T, K>;
};
type HTMLElements = {
    [K in keyof HTMLElementTagNameMap]: JSXElement<HTMLElementTagNameMap[K]>;
};
type SVGElements = {
    [K in keyof SVGElementTagNameMap]: JSXElement<SVGElementTagNameMap[K]>;
};
type __IntrinsicElements = HTMLElements & SVGElements;
declare global {
    namespace JSX {
        type IntrinsicElements = __IntrinsicElements;
    }
}
type SVGProxy = {
    [P in keyof SVGElements]: P;
};
export declare const svg: SVGProxy;
export declare function h(name: string | ((...args: any[]) => HTMLElement), attrs?: {
    [key: string]: any;
}, ...children: any): Element;
export {};
