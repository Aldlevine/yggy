import { bind, h } from "../yggy/basic/jsx.js";
import * as yggy from "../yggy/index.js";

import { Slider, SliderModel } from "./slider.js";

export type Model = yggy.ObservableObject & {
    volume_slider: SliderModel,
    other_slider: SliderModel,
    fname: yggy.ObservableValue<string>;
    lname: yggy.ObservableValue<string>;
}

export function App(model: Model): HTMLElement {
    fetch("./qr.svg").then(async (svg) => {
        const qrcode = document.getElementById("qrcode")!;
        qrcode.innerHTML = (await svg.text()).replace(/svg:/g, "");
    });

    return (
        <div id="app">
            <h1>yggy</h1>

            <hr />

            <p>
                <h3>text entry</h3>

                <p>
                    <label>First Name: <input type="text" value={bind(model.fname, "input")} /></label>
                </p>

                <p>
                    <label>Last Name: <input type="text" value={bind(model.lname, "input")} /></label>
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
                    Volume: <Slider {...model.volume_slider} />
                </p>

                <p>
                    The volume slider value is: {model.volume_slider.value}!
                </p>

                <p>
                    Other: <Slider {...model.other_slider} />
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

