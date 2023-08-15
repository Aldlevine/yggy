import * as yggy from "../yggy/index.js";

declare global {
    interface Window {
        comm: yggy.Comm
        obs_manager: yggy.ObservableManager
    }
}

const comm = window.comm = new yggy.Comm();
const comm_ws = new yggy.CommWS(comm, location.hostname, 5678);
const obs_manager = new yggy.ObservableManager(comm);

window.obs_manager = obs_manager;


comm.recv(yggy.OBSERVABLE_REGISTER_MSG, (obs: any) => {
    console.log(obs);
});

const slider = <HTMLInputElement>document.getElementById("slider")
const readout = <HTMLInputElement>document.getElementById("readout");
let obs: yggy.Observable<number>

comm.recv(yggy.OBSERVABLE_READY_MSG, () => {
    obs = obs_manager.get(0)!;

    readout.value = slider.value = String(obs.value);

    slider.addEventListener("input", () => {
        obs.value = Number(slider.value) || 0;
    });
    readout.addEventListener("input", () => {
        obs.value = Number(readout.value) || 0;
    });
});


comm.recv(yggy.OBSERVABLE_CHANGE_MSG, (data) => {
    if (data.data_id == obs?.id) {
        slider.value = String(data["new_value"]);
        readout.value = String(data["new_value"]);
    }
});



