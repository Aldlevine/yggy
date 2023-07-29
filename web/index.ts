import { update_model, start, sock } from "./rpc_import.js";

const observables: { [key: string]: Observable<any> } = {}
const js_updated_observables: Set<Observable<any>> = new Set()

type ObserverFn_t<T> = (old_value: T, new_value: T) => void;

class Observable<T> {

    _id: string
    _value: T
    _observers: Set<ObserverFn_t<T>> = new Set()

    constructor(id: string, value: T) {
        this._id = id;
        this._value = value;
    }

    get value(): T {
        return this._value;
    }

    set value(value: T) {
        this._value = value;
        js_updated_observables.add(this);
    }

    set py_value(value: T) {
        this._value = value;
    }

    observe(fn: ObserverFn_t<T>): void {
        this._observers.add(fn);
    }

    unobserve(fn: ObserverFn_t<T>): void {
        this._observers.delete(fn);
    }
}

document.getElementById("button")?.addEventListener("click", function () {
    // hello(["Aaron", "Alison", "Nora"]);
    let obs: Observable<number> = observables["my_observable"];
    obs.value += 1;
    update_model(js_updated_observables);
    js_updated_observables.clear();
});

sock.on("register_observable", ([id, data]: [string, any]) => {
    let observable = new Observable(id, data);
    observables[id] = observable;
    observable.observe((old_value, new_value) => {
        console.log(old_value, new_value);
    });
});

sock.on("update_observable", ([id, data]: [string, any]) => {
    observables[id].py_value = data
});

start();

// sock.on("hello", (args: [number, string, number[]]) => {
//     ((num: number, str: string, list: number[]) => {
//         console.log(`hello num=${num}, str=${str}, list=${list}`);
//     })(...args);
// });
