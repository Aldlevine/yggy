import * as yg from "../yggy/__init__.js";
import { AppModel, NOT_CONNECTED } from "./app.js";

let comm: yg.Comm | null = null;
let comm_ws: yg.CommWS | null = null;

document.body.append(NOT_CONNECTED);

const main = async () => {
    const yg = await import("../yggy/__init__.js");
    const { App } = await import("./app.js");


    comm = new yg.Comm();
    comm_ws = new yg.CommWS(comm, location.hostname, 5678);
    const onet = new yg.ObservableNetwork(comm);

    // comm?.recv((msg, data) => {
    //     console.log(msg, data);
    // });

    comm?.recv("comm.closed", () => {
        if (!NOT_CONNECTED.isConnected) {
            document.body.innerHTML = "";
            document.body.append(NOT_CONNECTED);
        }
    });

    const app_create = (app_schema: yg.Message & { schema: yg.ModelSchema }) => {
        const model = yg.Model.from_schema<AppModel>(app_schema.schema);
        for (let observable of model.observables()) {
            onet.register(observable);
        }
        document.body.innerHTML = "";
        document.body.append(App(model));

        const hot_reload = async () => {
            console.log("HOT_RELOAD");
            comm?.unrecv("app.create", app_create);
            comm?.unrecv("hot_reload", hot_reload);

            comm_ws?.close();
            comm?.stop();

            const html = document.createElement("html");
            html.innerHTML = (await (await fetch("")).text());
            document.documentElement.removeChild(document.head);
            document.documentElement.removeChild(document.body);
            document.documentElement.appendChild(html.getElementsByTagName("head")[0]!);
            document.documentElement.appendChild(html.getElementsByTagName("body")[0]!);
            import("./__main__.js");
        };
        comm?.recv("hot_reload", hot_reload);
    }

    comm?.recv("app.create", app_create);
};

main();