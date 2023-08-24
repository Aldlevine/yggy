import * as yg from "../yggy/__init__.js";
import { PropertiesOf, bind, h } from "../yggy/basic/jsx.js";
import { __uuid4 } from "../yggy/utils.js";
import { SliderModel } from "./slider.g.js";
export * from "./slider.g.js";

type SliderViewModel = SliderModel & {
    label?: yg.Observable<string>
}

export function Slider(model: PropertiesOf<SliderViewModel>): HTMLElement {
    const id = __uuid4();
    return (
        <div class="slider" style={`display: inline;`}>
            <label for={id}>{model.label ?? ""}</label>
            <input
                type="range"
                min={model.min}
                max={model.max}
                step={model.step}
                value={bind(model.value, "input")}
            />
            <input
                id={id}
                type="number"
                min={model.min}
                max={model.max}
                step={model.step}
                value={bind(model.value, "change")}
            />
            {model.value}
        </div >
    );
}