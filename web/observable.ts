import { comm } from "./comm.js";

export type Change_t<T> = {
    id: string,
    old_value: T,
    new_value: T,
}

export type ObserverFn_t<T> = (change: Change_t<T>) => any;

export class Observable<T> {
    static observable_registry: { [id: string]: Observable<any> } = {};

    private _id: string
    private _value: T
    private _observers: Set<ObserverFn_t<T>>

    constructor(id: string, value: T) {
        this._id = id;
        this._value = value;
        this._observers = new Set();
    }

    get id(): string {
        return this._id;
    }

    get value(): T {
        return this._value;
    }

    set value(new_value: T) {
        comm.send("change", { id: this.id, old_value: this.value, new_value: new_value });
    }

    watch(observer: ObserverFn_t<T>): void {
        this._observers.add(observer);
    }

    unwatch(observer: ObserverFn_t<T>): void {
        this._observers.delete(observer);
    }

    notify(change: Change_t<T>): void {
        for (let observer of this._observers) {
            observer(change);
        }
    }

    static get(id: string): Observable<any> {
        return Observable.observable_registry[id];
    }

    __receive_change(change: Change_t<T>): void {
        this._value = change.new_value;
        this.notify(change);
    }
}

export class ObservableObject extends Observable<any> {
    constructor(id: string, value: { [key: string]: { id: string } }) {
        super(id, value);
        for (let key in value) {
            let id = value[key].id;

            if (!Observable.get(id)) { return; }

            Object.defineProperty(this, key, {
                get: () => Observable.get(id).value,
                set: (value: any) => Observable.get(id).value = value,
            });

            Observable.get(id).watch(() => {
                this.notify({ "id": this.id, old_value: this, new_value: this });
            });
        }
    }


    watch(observer: ObserverFn_t<any>): void;
    watch(key: string, observer: ObserverFn_t<any>): void;

    watch(...args: any[]): void {
        if (args.length == 1) {
            super.watch(args[0]);
        }
        else {
            Observable.get(this.value[args[0]].id).watch(args[1]);
        }
    }
}

comm.recv("register", (id: string, value: any) => {
    if (id in Observable.observable_registry) {
        return;
    }

    if (value && value["__observable_object"]) {
        Observable.observable_registry[id] = new ObservableObject(id, value);
    }
    else {
        Observable.observable_registry[id] = new Observable(id, value);
    }
});

comm.recv("unregister", (id: string) => {
    if (!(id in Observable.observable_registry)) {
        return;
    }
    delete Observable.observable_registry[id];
});

comm.recv("change", (change: Change_t<any>) => {
    Observable.get(change.id).__receive_change(change);
});