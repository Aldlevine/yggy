import { Observable } from "../yggy/__init__.js";
import { PropertiesOf, h } from "../yggy/basic/jsx.js";
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
    r: Observable<number>,
    g: Observable<number>,
    b: Observable<number>,
    a: Observable<number>,
}

export function Tint({ r = 1, g = 1, b = 1, a = 1 }: Partial<PropertiesOf<TintModel>>, ...children: Element[]): Element {
    const id = __uuid4();
    return (
        <div class="tint-wrapper" style={`display: inline; filter: url(#${id}-blur);`}>
            <svg-svg xmlns="http://www.w3.org/2000/svg" width="0" height="0">
                <svg-defs>
                    <svg-filter id={`${id}-blur`}>
                        <svg-feColorMatrix in="SourceGraphic" type="matrix" values={`
                        ${r}  0.00  0.00  0.00  0.00 
                        0.00  ${g}  0.00  0.00  0.00 
                        0.00  0.00  ${b}  0.00  0.00 
                        0.00  0.00  0.00  ${a}  0.00`}>
                        </svg-feColorMatrix>
                    </svg-filter>
                </svg-defs>
            </svg-svg>
            {...children}
        </div >
    );
}
