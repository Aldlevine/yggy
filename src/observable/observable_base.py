import abc
import uuid
from typing import TYPE_CHECKING, Any, Mapping
from weakref import WeakKeyDictionary

from ..codegen import HasCodegenBuiltin
from ..comm import ReceiverFn_t
from .messages import OBSERVABLE_CHANGE_MSG, BaseChangeMessage

if TYPE_CHECKING:
    from .observable_network import ObservableNetwork


__all__ = ["ObservableBase"]


class ObservableBase[Schema_T: Mapping[str, Any], Message_T: BaseChangeMessage](
    HasCodegenBuiltin, abc.ABC
):
    __network: "ObservableNetwork | None"
    __id: str
    __receivers: WeakKeyDictionary[ReceiverFn_t[Any], ReceiverFn_t[Any]]

    def __init__(self) -> None:
        super().__init__()

        self.__network = None
        self.__id = uuid.uuid4().hex
        self.__receivers = WeakKeyDictionary()

    @classmethod
    def __codegen_builtin__(cls) -> str:
        return cls.__name__

    @property
    def id(self) -> str:
        return self.__id

    @property
    def network(self) -> "ObservableNetwork | None":
        return self.__network

    def watch(self, __fn: ReceiverFn_t[Message_T]) -> ReceiverFn_t[Message_T]:
        if __fn in self.__receivers:
            return __fn

        def __recv_watch(__change: Message_T) -> None:
            if __change["data_id"] != self.id:
                return
            __fn(__change)

        self.__receivers[__fn] = __recv_watch

        if self.__network is not None:
            self.__network.comm.recv(OBSERVABLE_CHANGE_MSG, __recv_watch)

        return __fn

    def unwatch(self, __fn: ReceiverFn_t[Message_T]) -> ReceiverFn_t[Message_T]:
        if __fn in self.__receivers:
            if self.__network is not None:
                self.__network.comm.unrecv(
                    OBSERVABLE_CHANGE_MSG, self.__receivers[__fn]
                )
            del self.__receivers[__fn]
        return __fn

    def _register(self, __network: "ObservableNetwork") -> None:
        self.__network = __network
        for receiver in self.__receivers.values():
            self.__network.comm.recv(OBSERVABLE_CHANGE_MSG, receiver)

    @abc.abstractmethod
    def load_schema(self, schema: Schema_T) -> None:
        ...

    @abc.abstractmethod
    def __json__(self) -> Schema_T:
        ...

    @abc.abstractmethod
    def _handle_client_change(self, change: Message_T) -> None:
        ...
