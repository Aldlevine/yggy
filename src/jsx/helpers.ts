import { Observable, ObservableNetwork, ObservableOr } from "../__init__.js";
import { uuid } from "../utils/__init__.js";
import { __NodeTree, __html_to_dom } from "./node_tree.js";

export function tmpl(strings: TemplateStringsArray, ...args: any[]): Observable<string> {
    let network!: ObservableNetwork;
    function render_str(): string {
        const result: string[] = [strings[0]];
        args.forEach((obs: any, i: number) => {
            if (Observable.isObservable(obs)) {
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

    const obs = new Observable(render_str(), { id: uuid.uuid4(), remote: false });
    if (network) {
        network.register(obs as unknown as Observable<any>);
    }

    for (let arg of args) {
        if (Observable.isObservable(arg)) {
            arg.watch(() => {
                obs.set(render_str());
            });
        }
    }

    return obs;
}

const __expr_stanitize_reg = /[^\d.()*/+-\s]/g;
export function expr(strs: TemplateStringsArray, ...args: ObservableOr<number>[]): Observable<number> {
    if (__expr_stanitize_reg.test(strs.join(""))) {
        throw new Error(`Invalid expr: "${strs.join("${...}")}"`);
    }
    const body_arr: string[] = [`return (`];
    for (let i = 0; i < strs.length; i++) {
        body_arr.push(strs[i]);
        if (i < args.length) {
            body_arr.push(`a[${i}]`);
        }
    }
    body_arr.push(`);`);
    const body = body_arr.join("");
    const fn = new Function("a", body);
    const out = Observable.map(...args, (...args_: number[]) => {
        const result = <number>fn(args_);
        return result;
    });
    return out;
}

export function html(__html: Observable<string> | string): Observable<__NodeTree> | __NodeTree {
    if (Observable.isObservable(__html)) {
        const obs = Observable.map(__html, (h) => __html_to_dom(h));
        obs.coerce = (x) => x;
        return obs;
    }
    return __html_to_dom(<string>__html);
}

