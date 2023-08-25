import { Observable, get, watch } from "../yggy/__init__.js";
import { PropertiesOf, h, b } from "../yggy/basic/jsx.js";
import { __uuid4 } from "../yggy/utils.js";

export type BlurModel = {
    std_dev: Observable<number>;
}

export function Blur(model: PropertiesOf<BlurModel>, ...children: Element[]): Element {
    const id = __uuid4();
    return (
        <div class="blur-wrapper" style={`display: inline; filter: url(#${id}-blur);`}>

            <svg-svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
                <svg-defs>
                    <svg-filter id={`${id}-blur`}>
                        <svg-feGaussianBlur stdDeviation={model.std_dev}></svg-feGaussianBlur>
                    </svg-filter>
                </svg-defs>
            </svg-svg>
            {...children}
        </div >
    );
}

export type TintModel = {
    red: Observable<number>,
    green: Observable<number>,
    blue: Observable<number>,
    alpha: Observable<number>,
}

export function Tint({ red = 1, green = 1, blue = 1, alpha = 1 }: Partial<PropertiesOf<TintModel>>, ...children: Element[]): Element {
    const id = __uuid4();
    return (
        <div class="tint-wrapper" style={`display: inline; filter: url(#${id}-blur);`}>
            <svg-svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
                <svg-defs>
                    <svg-filter id={`${id}-blur`}>
                        <svg-feColorMatrix in="SourceGraphic" type="matrix" values={b`
                        ${red}  0.00  0.00  0.00  0.00 
                        0.00  ${green}  0.00  0.00  0.00 
                        0.00  0.00  ${blue}  0.00  0.00 
                        0.00  0.00  0.00  ${alpha}  0.00`}>
                        </svg-feColorMatrix>
                    </svg-filter>
                </svg-defs>
            </svg-svg>
            {...children}
        </div >
    );
}

export function Morphology({ radius = 0 }: { radius?: Observable<number> | number }, ...children: Element[]): Element {
    const id = __uuid4();
    return (
        <div class="morphology-wrapper" style={`display: inline; filter: url(#${id}-morphology);`}>
            <svg-svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
                <svg-defs>
                    <svg-filter id={`${id}-morphology`}>
                        <svg-feMorphology
                            operator={watch([radius], () => get(radius) >= 0 ? "dilate" : "erode")}
                            radius={watch([radius], () => Math.abs(get(radius)))}
                        />
                    </svg-filter>
                </svg-defs>
            </svg-svg>
            {...children}
        </div >
    );
}
