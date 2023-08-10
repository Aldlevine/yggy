import { Comm } from "../yggy/comm/comm.js";
import { CommWS } from "../yggy/comm/comm_ws.js";
import { ObservableManager, OBSERVABLE_CHANGE_MSG } from "../yggy/observable/observable_manager.js";

declare global {
    interface Window {
        comm: Comm
        obs_manager: ObservableManager
    }
}

const comm = window.comm = new Comm();
const comm_ws = new CommWS(comm, "0.0.0.0", 5678);
const obs_manager = new ObservableManager(comm);

comm.recv(OBSERVABLE_CHANGE_MSG, (data) => {
    console.log(data);
});

window.obs_manager = obs_manager;
