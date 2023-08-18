import os
from logging import getLevelNamesMapping, getLogger
from typing import Any

from . import yggy
from .app import AppModel, GlobalModel
from .qrcode import save_ip_qrcode

LOGLEVEL = os.environ.get("LOGLEVEL", "INFO")
level_id = getLevelNamesMapping()[LOGLEVEL]
getLogger().level = level_id

if __name__ == "__main__":
    global_model = GlobalModel()

    apps: dict[str, AppModel] = {}

    @yggy.manager.comm.recv(yggy.COMM_ADD_CLIENT_MSG)
    def recv_add_client(id: str) -> None:
        print("NEW APP", id)
        apps[id] = AppModel(gm=global_model)

    @yggy.manager.comm.recv(yggy.COMM_REMOVE_CLIENT_MSG)
    def recv_remove_client(id: str) -> None:
        print("DEL APP", id)
        del apps[id]

    @yggy.manager.comm.recv(yggy.OBSERVABLE_READY_MSG)
    def recv_obs_ready(
        msg: yggy.RegisterObjectMessage | yggy.RegisterValueMessage[Any],
    ) -> None:
        ...

    @yggy.manager.comm.recv(yggy.OBSERVABLE_REGISTER_MSG)
    def recv_obs_reg(
        msg: yggy.RegisterObjectMessage | yggy.RegisterValueMessage[Any],
    ) -> None:
        client_id: str | None = None
        app_id: str | None = None
        for id, a in apps.items():
            if a.id == msg["data_id"]:
                client_id = id
                app_id = a.id

        if client_id is not None and app_id is not None:
            print("OBS REG")
            yggy.manager.comm.send("load_obj", app_id, client_ids=[client_id])

    save_ip_qrcode(yggy.web_root)
    yggy.manager.run()
