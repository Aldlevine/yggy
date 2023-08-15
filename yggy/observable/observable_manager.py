from typing import Any, cast

from ..comm import (
    COMM_ADD_CLIENT_MSG,
    Comm,
    Message,
    STOP_PROPAGATION,
    StopPropagationType,
)
from .messages import (
    OBSERVABLE_CHANGE_MSG,
    OBSERVABLE_CLIENT_CHANGE_MSG,
    OBSERVABLE_READY_MSG,
    OBSERVABLE_REGISTER_MSG,
)
from .observable import Observable, ObservableChangeMessage
from .observable_value import ObservableValue

__all__ = [
    "ObservableManager",
]


class ReadyMessage(Message):
    ...


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

    def notify_change(self, __change: ObservableChangeMessage[Any]) -> None:
        data_id = __change["data_id"]

        if data_id in self.__notifying:
            return

        try:
            self.__notifying.add(data_id)
            self.__comm.send(OBSERVABLE_CHANGE_MSG, __change)
        finally:
            self.__notifying.discard(data_id)

    def __recv_change(
        self, __change: ObservableChangeMessage[Any]
    ) -> StopPropagationType:
        data_id = __change["data_id"]

        if data_id in self.__registry:
            obs = self.__registry[data_id]

            new_value = __change["new_value"]
            if isinstance(obs, ObservableValue):
                obs = cast(ObservableValue[Any], obs)
                obs.set(new_value)

        return STOP_PROPAGATION

    def __recv_add_client(self, __client_id: str) -> None:
        for observable in self.__registry.values():
            self.__comm.send(
                OBSERVABLE_REGISTER_MSG, observable.__json__(), client_ids=[__client_id]
            )
        self.__comm.send(OBSERVABLE_READY_MSG, ReadyMessage(), client_ids=[__client_id])
