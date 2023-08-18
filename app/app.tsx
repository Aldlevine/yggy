import { PropertiesOf, bind, h } from "../yggy/basic/jsx.js";
import * as yggy from "../yggy/index.js";

import { Slider, SliderModel } from "./slider.js";

export type AppModel = yggy.ObservableObject & {
    volume_slider: SliderModel,
    other_slider: SliderModel,
    fname: yggy.ObservableValue<string>;
    fname_width: yggy.ObservableValue<number>;
    lname: yggy.ObservableValue<string>;
    lname_width: yggy.ObservableValue<number>;
}

export function App(model: PropertiesOf<AppModel>): HTMLElement {
    fetch("./qr.svg").then(async (svg) => {
        const qrcode = document.getElementById("qrcode")!;
        qrcode.innerHTML = (await svg.text()).replace(/svg:/g, "");
        qrcode.firstElementChild!.innerHTML = "<title>qr code</title>" + qrcode.firstElementChild!.innerHTML;
    });

    return (
        <div id="app">
            <link rel="stylesheet" href={`./index.css?${Date.now()}`} />
            <h1>yggy</h1>

            <hr />

            <p>
                <h3>text entry</h3>

                <p>
                    <label>First Name: <input type="text" value={bind(model.fname, "input")} placeholder="John" size={model.fname_width} style="width: auto" /></label>
                </p>

                <p>
                    <label>Last Name: <input type="text" value={bind(model.lname, "input")} placeholder="Doe" size={model.lname_width} style="width: auto" /></label>
                </p>

                <p>
                    Hello, {model.fname} {model.lname}! How are you doing?
                </p>
            </p>

            <p>
                <br />
                <h3>sliders</h3>

                <p>
                    <label>Min: <input type="number" value={bind(model.volume_slider.min, "change")} /></label>
                    <label style="padding: 1em;">Max: <input type="number" value={bind(model.volume_slider.max, "change")} /></label>
                    <label>Step: <input type="number" value={bind(model.volume_slider.step, "change")} /></label>
                </p>

                <p>
                    <label><Slider {...{ label: "Volume: ", ...model.volume_slider }} /></label>
                </p>

                <p>
                    The volume slider value is: {model.volume_slider.value}!
                </p>

                <p>
                    <label><Slider {...{ label: "Other: ", ...model.other_slider, max: 100 }} /></label>
                </p>

                <p>
                    The other slider value is: {model.other_slider.value}!
                </p>
            </p>

            <p>
                <br />
                <h3>qr code</h3>

                <p id="qrcode"></p>
            </p>

        </div>
    );
}

