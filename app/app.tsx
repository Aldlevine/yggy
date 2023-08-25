import * as yg from "../yggy/__init__.js";
import { PropertiesOf, bind, h, html } from "../yggy/basic/jsx.js";

import { Blur, Morphology, Tint } from "./fx.js";
import { Slider, SliderModel } from "./slider.js";

// @ts-expect-error
import { default as dayjs } from "https://esm.sh/dayjs@1.11.9/esm/index.js";
// @ts-expect-error
import { default as duration } from "https://esm.sh/dayjs@1.11.9/esm/plugin/duration.js";

dayjs.extend(duration);

export type AppModel = {
    fname: yg.Observable<string>;
    fname_width: yg.Observable<number>;
    lname: yg.Observable<string>;
    lname_width: yg.Observable<number>;
    full_name: yg.Observable<string>;

    volume_slider: SliderModel;
    blur_slider: SliderModel;
    red: yg.Observable<number>;
    green: yg.Observable<number>;
    blue: yg.Observable<number>;
    alpha: yg.Observable<number>;
    morph_radius: yg.Observable<number>;

    session_time: yg.Observable<number>;
    greeting: yg.Observable<string>;
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
                    Session Time: {yg.watch([model.session_time], () => {
                        return dayjs.duration(yg.get(model.session_time)).format("HH[h] mm[m] ss[s]");
                    })}
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
                    Hello, <b>{model.full_name}</b>! How are you doing?
                    <br />
                    {html(model.greeting)}
                    <br />
                    {model.greeting}
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
                    <Blur std_dev={model.blur_slider.value}>
                        <label><Slider {...model.blur_slider} label="Blur:" /></label>
                    </Blur>
                </p>

                <p>
                    The blur slider value is: {model.blur_slider.value}!
                </p>

                <p>
                    <Tint
                        red={model.red}
                        green={model.green}
                        blue={model.blue}
                        alpha={model.alpha}
                    >
                        <label><Slider value={model.red} label={"R:"} min={0} max={1} step={0.01} /></label><br />
                        <label><Slider value={model.green} label={"G:"} min={0} max={1} step={0.01} /></label><br />
                        <label><Slider value={model.blue} label={"B:"} min={0} max={1} step={0.01} /></label><br />
                        <label><Slider value={model.alpha} label={"A:"} min={0} max={1} step={0.01} /></label><br />
                    </Tint>
                </p>

                <p>
                    The color slider values are ({model.red}, {model.green}, {model.blue}, {model.alpha})
                </p>

                <p>
                    <Morphology radius={model.morph_radius}>
                        <label><Slider value={model.morph_radius} label={"Morph Radius:"} min={-5} max={5} step={1} /></label><br />
                    </Morphology>
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

