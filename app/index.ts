import * as yggy from "../yggy/index.js";
import { App, Model } from "./app.js";

const comm = new yggy.Comm();
const comm_ws = new yggy.CommWS(comm, location.hostname, 5678);
const obs_manager = new yggy.ObservableManager(comm);

comm.recv("load_obj", (id: string) => {
    const model = <Model>obs_manager.get(id)!;
    document.body.append(App(model));


    comm.recv("hot_reload", () => {
        location.reload();
    });

    document.body.classList.remove("hidden");
});
