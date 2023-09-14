from typing import Any, Iterable
from weakref import WeakKeyDictionary, WeakValueDictionary

from ..comm import Comm, LazyMessage
from .messages import (
    OBSERVABLE_CHANGE_MSG,
    OBSERVABLE_CLIENT_CHANGE_MSG,
    BaseChangeMessage,
)
from .observable_base import ObservableBase

__all__ = [
    "ObservableNetwork",
]


class ObservableNetwork:
    __registry: WeakValueDictionary[str, ObservableBase[Any, Any]]
    __client_registry: WeakKeyDictionary[ObservableBase[Any, Any], set[str]]
    __comm: Comm

    def __init__(self, __comm: Comm) -> None:
        self.__registry = WeakValueDictionary()
        self.__client_registry = WeakKeyDictionary()
        self.__comm = __comm

        self.__comm.recv(OBSERVABLE_CLIENT_CHANGE_MSG, self.__recv_client_change)

    @property
    def comm(self) -> Comm:
        return self.__comm

    def register(
        self,
        __observables: ObservableBase[Any, Any] | Iterable[ObservableBase[Any, Any]],
        clients: Iterable[str] | None = None,
    ) -> None:
        if isinstance(__observables, Iterable):
            observables = list(__observables)
        else:
            observables = [__observables]

        for observable in observables:
            self.__registry[observable.id] = observable
            observable._register(self)  # type: ignore[friends til the end]

        if clients is None:
            return

        for observable in observables:
            cur_clients = self.__client_registry.setdefault(observable, set[str]())
            cur_clients.update(clients)

    # def unregister(self, __observable: Observable[Any]) -> None:
    #     del self.__registry[__observable.id]

    def send_change(
        self,
        __observable: ObservableBase[Any, Any],
        __change: BaseChangeMessage | LazyMessage[BaseChangeMessage],
    ) -> None:
        self.__comm.send(
            OBSERVABLE_CHANGE_MSG,
            __change,
            client_ids=self.__client_registry.get(__observable, []),
        )

    def notify_change(
        self,
        __observable: ObservableBase[Any, Any],
        __change: BaseChangeMessage,
    ) -> None:
        self.__comm.notify(
            OBSERVABLE_CHANGE_MSG,
            __change,
        )

    def emit_change(
        self,
        __observable: ObservableBase[Any, Any],
        __change: BaseChangeMessage | LazyMessage[BaseChangeMessage],
    ) -> None:
        self.__comm.emit(
            OBSERVABLE_CHANGE_MSG,
            __change,
            client_ids=self.__client_registry.get(__observable, []),
        )

    def __recv_client_change(self, __change: BaseChangeMessage) -> None:
        data_id = __change["data_id"]

        if data_id in self.__registry:
            obs = self.__registry[data_id]
            obs._handle_client_change(__change)  # type: ignore[you got a friend in me]
