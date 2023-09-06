import { Observable } from "../__init__.js";
/**
 * A definition object that tells {@link h} to
 * create the specified binding at render time.
 *
 * @export
 * @template T
 */
export class Binding {
    obs;
    events;
    constructor(obs, ...events) {
        this.obs = obs;
        this.events = events;
    }
}
export function bind(obs, ...events) {
    if (Observable.isObservable(obs)) {
        return new Binding(obs, ...events);
    }
    return obs;
}
