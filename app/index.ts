import { Comm } from "../yggy/comm/comm.js";
import { CommWS } from "../yggy/comm/comm_ws.js";
import { Observable } from "../yggy/observable/observable.js";
import { OBSERVABLE_CHANGE_MSG, OBSERVABLE_READY_MSG, ObservableManager } from "../yggy/observable/observable_manager.js";

declare global {
    interface Window {
        comm: Comm
        obs_manager: ObservableManager
    }
}

const comm = window.comm = new Comm();
const comm_ws = new CommWS(comm, location.hostname, 5678);
const obs_manager = new ObservableManager(comm);

window.obs_manager = obs_manager;


comm.recv("observable.register", (obs: any) => {
    console.log(obs);
});

const slider = <HTMLInputElement>document.getElementById("slider")
const readout = <HTMLInputElement>document.getElementById("readout");
let obs: Observable<number>

comm.recv(OBSERVABLE_READY_MSG, () => {
    obs = obs_manager.get(0)!;

    readout.value = slider.value = String(obs.value);

    slider.addEventListener("input", () => {
        obs.value = Number(slider.value) || 0;
    });
    readout.addEventListener("input", () => {
        obs.value = Number(readout.value) || 0;
    });
});


comm.recv(OBSERVABLE_CHANGE_MSG, (data) => {
    if (data.data_id == obs?.id) {
        slider.value = String(data["new_value"]);
        readout.value = String(data["new_value"]);
    }
});



