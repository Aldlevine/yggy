export declare interface Callable<TArgs extends unknown[], TRet> {
    (...args: TArgs): TRet;
    new(): this;
}


export abstract class Callable<TArgs extends unknown[], TRet> extends Function {
    constructor() {
        super("thisArg, ...args", "return thisArg.__call__(...args)");

        const ret: this = this.bind(this, this);
        this.__call__ = this.__call__.bind(ret);
        return ret;
    }

    abstract __call__(...args: TArgs): TRet;
}