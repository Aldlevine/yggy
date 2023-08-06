import { SliderModel } from "./icomponents.js";
import { Component } from "./component.js";
import { Change_t } from "./observable.js";


export class Slider extends Component<SliderModel> {
    render(): Element {
        let el = document.createElement("div");

        let slider = document.createElement("input");
        slider.type = "range";
        slider.min = this._model.min.toString();
        slider.max = this._model.max.toString();
        slider.value = this._model.val.toString();
        slider.step = this._model.step.toString();
        slider.addEventListener("input", () => this._model.val = Number(slider.value));

        let readout = document.createElement("input");
        readout.type = "number";
        readout.min = this._model.min.toString();
        readout.max = this._model.max.toString();
        readout.value = this._model.val.toString();
        readout.step = this._model.step.toString();
        readout.addEventListener("input", () => this._model.val = Number(readout.value));

        this._model.watch("val", (change: Change_t<number>) => readout.value = slider.value = change.new_value.toString());
        this._model.watch("min", (change: Change_t<number>) => slider.min = change.new_value.toString());
        this._model.watch("max", (change: Change_t<number>) => slider.max = change.new_value.toString());

        el.appendChild(slider);
        el.appendChild(readout);

        return el;
    }
}