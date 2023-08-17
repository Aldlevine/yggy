import { bind, h } from "../yggy/basic/jsx.js";
import { ObservableValue } from "../yggy/index.js";

export type SliderModel = {
    min: ObservableValue<number>;
    max: ObservableValue<number>;
    step: ObservableValue<number>;
    value: ObservableValue<number>;
}

export function Slider({ min, max, step, value }: SliderModel): JSX.Element {
    return <div class="slider" style="display: inline">
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={bind(value, "input")}
        />
        <input
            type="number"
            min={min}
            max={max}
            step={step}
            value={bind(value, "change")}
        />
    </div>
}