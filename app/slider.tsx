import { PropertiesOf, bind, h } from "../yggy/basic/jsx.js";
import { ObservableValue } from "../yggy/index.js";
import { __uuid4 } from "../yggy/utils.js";

export type SliderModel = {
    min: ObservableValue<number>;
    max: ObservableValue<number>;
    step: ObservableValue<number>;
    value: ObservableValue<number>;
}

type SliderProps = {
    label?: string
}

export function Slider({ min, max, step, value, ...props }: PropertiesOf<SliderModel> & SliderProps): HTMLElement {
    const id = __uuid4();
    const label = props.label ?? ""
    return <div class="slider" style="display: inline;">
        <label for={id}>{label}</label>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={bind(value, "input")}
        />
        <input
            id={id}
            type="number"
            min={min}
            max={max}
            step={step}
            value={bind(value, "change")}
        />
    </div>
}