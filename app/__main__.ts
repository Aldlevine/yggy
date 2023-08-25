import * as yg from "../yggy/__init__.js";
import { AppModel, NOT_CONNECTED } from "./app.js";

let comm: yg.Comm | null = null;
let comm_ws: yg.CommWS | null = null;

let not_connected_timout: number;

const main = async () => {
    const yg = await import("../yggy/__init__.js");
    const { App } = await import("./app.js");


    comm = new yg.Comm();
    comm_ws = new yg.CommWS(comm, location.hostname, 5678);
    const network = new yg.ObservableNetwork(comm);

    // comm?.recv((msg, data) => {
    //     console.log(msg, data);
    // });

    comm?.recv("comm.closed", () => {
        not_connected_timout = setTimeout(() => {
            if (!NOT_CONNECTED.isConnected) {
                document.body.innerHTML = "";
                document.body.append(NOT_CONNECTED);
            }
        }, 5000);
    });

    const app_create = (app_schema: yg.Message & { schema: yg.ModelSchema }) => {
        clearTimeout(not_connected_timout);

        const model = yg.Model.from_schema<AppModel>(app_schema.schema);
        for (let observable of model.observables()) {
            network.register(observable);
        }
        const app = App(model);
        const [top, left] = [document.documentElement.scrollTop, document.documentElement.scrollLeft]
        document.body.innerHTML = "";
        document.body.append(app);
        document.documentElement.scrollTop = top;
        document.documentElement.scrollLeft = left;

        const hot_reload = async () => {
            console.log("HOT_RELOAD");
            comm?.unrecv("app.create", app_create);
            comm?.unrecv("hot_reload", hot_reload);
            comm_ws?.close();
            comm?.stop();
            import("./__main__.js");
        };
        comm?.recv("hot_reload", hot_reload);
    }

    comm?.recv("app.create", app_create);
};

main();