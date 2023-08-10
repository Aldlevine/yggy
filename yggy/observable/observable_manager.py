from typing import Any

from ..comm import Comm, COMM_ADD_CLIENT_MSG

from .observable import Observable, ObservableChange
from .observable_value import ObservableValue

__all__ = [
    "OBSERVABLE_CHANGE_MSG",
    "OBSERVABLE_CLIENT_CHANGE_MSG",
    "OBSERVABLE_REGISTER_MSG",
    "ObservableManager",
]

OBSERVABLE_CHANGE_MSG = "observable.change"
OBSERVABLE_CLIENT_CHANGE_MSG = "observable.client_change"
OBSERVABLE_REGISTER_MSG = "observable.register"


class ObservableManager:
    __registry: dict[str, Observable[Any]]
    __comm: Comm

    __notifying: set[str]

    def __init__(self, __comm: Comm) -> None:
        self.__registry = {}
        self.__comm = __comm
        self.__notifying = set()

        self.__comm.recv(OBSERVABLE_CLIENT_CHANGE_MSG, self.__recv_change)
        self.__comm.recv(COMM_ADD_CLIENT_MSG, self.__recv_add_client)

    @property
    def comm(self) -> Comm:
        return self.__comm

    def register(self, __observable: Observable[Any]) -> None:
        self.__registry[__observable.id] = __observable

    def unregister(self, __observable: Observable[Any]) -> None:
        del self.__registry[__observable.id]

    async def notify_change(self, __change: ObservableChange[Any]) -> None:
        data_id = __change["data_id"]

        if data_id in self.__notifying:
            return

        try:
            self.__notifying.add(data_id)
            await self.__comm.send(OBSERVABLE_CHANGE_MSG, __change)
        finally:
            self.__notifying.discard(data_id)

    async def __recv_change(self, __change: ObservableChange[Any]) -> None:
        data_id = __change["data_id"]
        if data_id not in self.__registry:
            return

        obs = self.__registry[data_id]

        new_value = __change["new_value"]
        await obs.set_async(new_value)

    async def __recv_add_client(self, __client_id: str) -> None:
        for observable in self.__registry.values():
            await self.__comm.send(OBSERVABLE_REGISTER_MSG, observable.__json__(), client_ids=[__client_id])

    def value[T](self, __value: T) -> ObservableValue[T]:
        return ObservableValue(self, __value)
