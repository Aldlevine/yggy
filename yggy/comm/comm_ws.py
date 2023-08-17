import asyncio
from dataclasses import dataclass
from threading import Thread
from typing import Any, Coroutine

from websockets import server
from websockets.exceptions import ConnectionClosedError

from ..json import json
from ..logging import get_logger
from .comm import Comm, SendKwds

__all__ = ["CommWS"]

logger = get_logger(__loader__.name)


@dataclass
class CommWSMessage:
    msg: str
    data: Any


class CommWS:
    __comm: Comm
    __host: str
    __port: int
    __connections: dict[str, server.WebSocketServerProtocol]

    def __init__(
        self,
        comm: Comm,
        host: str = "localhost",
        port: int = 5678,
    ) -> None:
        self.__comm = comm
        self.__host = host
        self.__port = port
        self.__connections = {}

        comm.add_sender(self.__do_send)

    @property
    def comm(self) -> Comm:
        return self.__comm

    @property
    def host(self) -> str:
        return self.__host

    @property
    def port(self) -> int:
        return self.__port

    @property
    def connections(self) -> dict[str, server.WebSocketServerProtocol]:
        return self.__connections

    def run(self) -> None:
        self.__loop = asyncio.new_event_loop()
        self.__loop.run_until_complete(self.__serve())

    def start(self) -> None:
        self.__thread = Thread(target=self.run, daemon=True)
        self.__thread.start()

    def stop(self) -> None:
        self.__loop.stop()

    async def __do_send(self, msg: str, data: Any, kwds: SendKwds) -> None:
        coros: list[Coroutine[Any, Any, Any]] = []
        for client_id, websocket in tuple(self.__connections.items()):
            if "client_ids" not in kwds or client_id in kwds["client_ids"]:
                coros.append(websocket.send(json.dumps({"msg": msg, "data": data})))
        await asyncio.gather(*coros)

    async def __on_connection(self, websocket: server.WebSocketServerProtocol) -> None:
        client_id = self.__comm.new_client_id()
        self.__connections[client_id] = websocket

        try:
            self.__comm.add_client(client_id)

            try:
                async for message in websocket:
                    event = CommWSMessage(**json.loads(message))
                    self.__comm.send(event.msg, event.data)
            except ConnectionClosedError:
                logger.debug(f"CONNECTION CLOSED {client_id}")

        finally:
            del self.__connections[client_id]
            self.__comm.remove_client(client_id)

    async def __serve(self) -> None:
        async with server.serve(self.__on_connection, self.__host, self.__port):
            await asyncio.Future()
