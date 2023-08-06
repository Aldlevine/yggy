import { comm } from "./comm.js";
import { Observable, ObservableObject } from "./observable.js";

// declare module "./icomponents.js" {
//     const exports: { [key: string]: typeof Component<any> };
//     export = exports;
// }
// import * as Components from "./icomponents.js";

export class Component<Model extends ObservableObject> {
    protected _model: Model
    private _element?: Element;

    constructor(model: Model) {
        this._model = model;
    }

    render(): Element {
        throw new Error("Not implemented");
    }

    attach(selector: string): void;
    attach(selector: Element): void;

    attach(element: Element | string): void {
        if (typeof element === "string") {
            element = document.querySelector(element)!;
        }
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
        this._element = this.render();
        element.appendChild(this._element);
    }

    detach(): void {
        this._element?.parentElement?.removeChild(this._element);
        delete this._element;
    }
}

comm.recv("component.attach", async (parent_element: string, component_name: string, model_id: string) => {
    const Components: { [key: string]: typeof Component<any> } = await import("./components.js");
    let model = Observable.get(model_id);
    let component_type = Components[component_name];
    if (component_type.prototype instanceof Component) {
        let component = new component_type(model);
        console.log(component);
        component.attach(parent_element);
    }
});
