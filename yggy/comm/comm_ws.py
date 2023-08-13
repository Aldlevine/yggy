import asyncio
from dataclasses import dataclass
from typing import Any

from websockets import server

from ..json import json
from .comm import Comm, SendKwds


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

    async def __do_send(self, msg: str, data: Any, kwds: SendKwds) -> None:
        for client_id, websocket in self.__connections.items():
            if "client_ids" not in kwds or client_id in kwds["client_ids"]:
                await websocket.send(json.dumps({"msg": msg, "data": data}))

    async def __on_connection(self, websocket: server.WebSocketServerProtocol) -> None:
        client_id = self.__comm.get_client_id()
        self.__connections[client_id] = websocket

        try:
            await self.__comm.add_client(client_id)

            async for message in websocket:
                event = CommWSMessage(**json.loads(message))
                await self.__comm.send(event.msg, event.data)

        finally:
            del self.__connections[client_id]
            await self.__comm.remove_client(client_id)

    async def __serve(self) -> None:
        async with server.serve(self.__on_connection, self.__host, self.__port):
            await asyncio.Future()

    def run(self) -> None:
        try:
            asyncio.run(self.__serve())
        except RuntimeError:
            loop = asyncio.get_running_loop()
            loop.create_task(self.__serve())
