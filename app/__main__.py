import os
from logging import getLevelNamesMapping
from typing import Any

from yggy.logging import get_logger

from . import yggy
from .app import AppModel, GlobalModel
from .qrcode import save_ip_qrcode

LOGLEVEL = os.environ.get("LOGLEVEL", "INFO")
level_id = getLevelNamesMapping()[LOGLEVEL]
get_logger().level = level_id

logger = get_logger(f"{__package__}.{__name__}")

if __name__ == "__main__":
    global_model = GlobalModel()

    apps: dict[str, AppModel] = {}

    @yggy.manager.comm.recv(yggy.COMM_ADD_CLIENT_MSG)
    def recv_add_client(id: str) -> None:
        apps[id] = AppModel(gm=global_model)
        logger.info(f"Create App {apps[id].id} for client {id}")

    @yggy.manager.comm.recv(yggy.COMM_REMOVE_CLIENT_MSG)
    def recv_remove_client(id: str) -> None:
        logger.info(f"Delete App {apps[id].id} for client {id}")
        apps.pop(id).close()

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
        for id, app in apps.items():
            if app.id == msg["data_id"]:
                client_id = id
                app_id = app.id

        if client_id is not None and app_id is not None:
            logger.info(f"Register App {app_id} for client {client_id}")
            yggy.manager.comm.send("app.register", app_id, client_ids=[client_id])

    save_ip_qrcode(yggy.web_root)
    yggy.manager.run()
