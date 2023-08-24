import * as yg from "../yggy/__init__.js";

export type SliderModel = {
    min: yg.Observable<number>;
    max: yg.Observable<number>;
    step: yg.Observable<number>;
    value: yg.Observable<number>;
}
