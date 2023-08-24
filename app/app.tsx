import * as yg from "../yggy/__init__.js";
import { PropertiesOf, bind, h } from "../yggy/basic/jsx.js";

import { Blur, Tint } from "./fx.js";
import { Slider, SliderModel } from "./slider.js";

export type AppModel = {
    volume_slider: SliderModel,
    blur_slider: SliderModel,
    fname: yg.Observable<string>;
    fname_width: yg.Observable<number>;
    lname: yg.Observable<string>;
    lname_width: yg.Observable<number>;
    full_name: yg.Observable<string>;
    blur: yg.Observable<number>;
    session_time: yg.Observable<number>;
}

export const NOT_CONNECTED: HTMLDivElement = (
    <div class="fade-in">
        <h1>
            NOT CONNECTED
        </h1>
    </div>
);

export function App(model: PropertiesOf<AppModel>): HTMLDivElement {
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
                <small>
                    Session Time: {model.session_time}
                </small>
            </p>

            <p>
                <br />
                <h3>text entry</h3>

                <p>
                    <label>First Name: <input type="text" value={bind(model.fname, "input")} placeholder="John" size={model.fname_width} style="width: auto" /></label>
                </p>

                <p>
                    <label>Last Name: <input type="text" value={bind(model.lname, "input")} placeholder="Doe" size={model.lname_width} style="width: auto" /></label>
                </p>

                <p>
                    Hello, {model.full_name}! How are you doing?
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
                    <label><Slider {...model.volume_slider} label="Volume:" /></label>
                </p>

                <p>
                    The volume slider value is: {model.volume_slider.value}!
                </p>

                <p>
                    <Tint r={2} g={0.5} b={0.5}>
                        <Blur std_dev={model.blur_slider.value}>
                            <label><Slider {...model.blur_slider} label="Blur:" max={1} /></label>
                        </Blur>
                    </Tint>
                </p>

                <p>
                    The blur slider value is: {model.blur_slider.value}!
                </p>
            </p>

            <p>
                <br />
                <h3>diagram</h3>

                <img class="yggy-light" src="./yggy_light.gif" />
                <img class="yggy-dark" src="./yggy_dark.gif" />
            </p>

            <p>
                <br />
                <h3>qr code</h3>

                <p id="qrcode"></p>
            </p>

        </div>
    );
}

