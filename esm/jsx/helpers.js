import { Observable } from "../__init__.js";
import { uuid } from "../utils/__init__.js";
import { __html_to_dom } from "./node_tree.js";
export function tmpl(strings, ...args) {
    let network;
    function render_str() {
        const result = [strings[0]];
        args.forEach((obs, i) => {
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
        network.register(obs);
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
    const out = Observable.map(...args, (...args_) => {
        const result = fn(args_);
        return result;
    });
    return out;
}
export function html(__html) {
    if (Observable.isObservable(__html)) {
        const obs = Observable.map(__html, (h) => __html_to_dom(h));
        obs.coerce = (x) => x;
        return obs;
    }
    return __html_to_dom(__html);
}
