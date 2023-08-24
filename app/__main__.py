import os
from logging import getLevelNamesMapping
from typing import Any

from yggy.logging import get_logger

from . import yg
from .app import AppModel, GlobalModel
from .qrcode import save_ip_qrcode

LOGLEVEL = os.environ.get("LOGLEVEL", "INFO")
level_id = getLevelNamesMapping()[LOGLEVEL]
get_logger().level = level_id

logger = get_logger(f"{__package__}.{__name__}")


class CreateAppMessage(yg.Message):
    schema: dict[str, Any]


if __name__ == "__main__":
    global_model = GlobalModel()

    app_models: dict[str, AppModel] = {}

    @yg.manager.comm.recv(yg.COMM_ADD_CLIENT_MSG)
    def recv_add_client(msg: yg.ModifyClientMessage) -> None:
        client_id = msg["client_id"]
        app_model = app_models[client_id] = AppModel(global_model)
        logger.info(f"Create App {app_model.id} for client {client_id}")

        yg.manager.network.register(app_model.observables, [client_id])
        yg.manager.comm.send(
            "app.create",
            yg.create_message(
                CreateAppMessage,
                {"schema": {**app_model.__json__(), **global_model.__json__()}},
            ),
            client_ids=[client_id],
        )

    @yg.manager.comm.recv(yg.COMM_REMOVE_CLIENT_MSG)
    def recv_remove_client(msg: yg.ModifyClientMessage) -> None:
        logger.info(
            f"Delete App {app_models[msg['client_id']].id} for client"
            f" {msg['client_id']}"
        )
        app_models.pop(msg["client_id"])

    save_ip_qrcode(yg.web_root)
    yg.manager.run()
