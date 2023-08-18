import type * as yggy from "../yggy/index.js";
import type { AppModel } from "./app.js";

let comm: yggy.Comm | null = null;
let comm_ws: yggy.CommWS | null = null;

const main = async () => {
    const yggy = await import("../yggy/index.js");
    const { App } = await import("./app.js");


    comm = new yggy.Comm();
    comm_ws = new yggy.CommWS(comm, location.hostname, 5678);
    const obs_manager = new yggy.ObservableManager(comm);

    comm?.recv("load_obj", (id: string) => {
        const model = <AppModel>obs_manager.get(id)!;
        document.body.innerHTML = "";
        document.body.append(App(model));

        const hot_reload = async () => {
            console.log("HOT_RELOAD");
            comm?.unrecv("hot_reload", hot_reload);
            comm_ws?.close();

            const html = document.createElement("html");
            html.innerHTML = (await (await fetch("")).text());
            document.documentElement.removeChild(document.head);
            document.documentElement.removeChild(document.body);
            document.documentElement.appendChild(html.getElementsByTagName("head")[0]!);
            document.documentElement.appendChild(html.getElementsByTagName("body")[0]!);
            import("./__main__.js");
        };
        comm?.recv("hot_reload", hot_reload);

        document.body.classList.remove("hidden");
    });
};

main();