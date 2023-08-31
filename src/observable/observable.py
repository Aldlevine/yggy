import uuid
from typing import TYPE_CHECKING, Any, Callable
from weakref import WeakKeyDictionary

from ..comm import LazyMessage, ReceiverFn_t, create_message
from ..logging import get_logger
from ..types import Primitive
from ..utils.functools import noop
from .messages import OBSERVABLE_CHANGE_MSG, ChangeMessage
from .schema import ObservableSchema

if TYPE_CHECKING:
    from .observable_network import ObservableNetwork

__all__ = [
    "Observable",
    "get",
]

logger = get_logger(f"{__name__}")


def get[T: Primitive](obs: "Observable[T] | T") -> T:
    if isinstance(obs, Observable):
        return obs.get()
    return obs


class Observable[T: Primitive]:
    """An observable primitive value.

    When registered with an #ObservableNetwork it will emit and receive
    change messages through the #Comm. When an #Observable recieves
    a client change message, it will update its value and in turn
    emit a change message.

    While an #Observable may be created and registered manually,
    it is advised to construct them as part of a #Model through
    the use of #obs and related configuration functions.

    TODO: make lazy messaging optional

    """

    __network: "ObservableNetwork | None"
    __id: str
    __value: T
    __coerce: Callable[[Any], T]
    __validate: Callable[[T], T]
    __receivers: WeakKeyDictionary[ReceiverFn_t[Any], ReceiverFn_t[Any]]
    __lazy_message: LazyMessage[ChangeMessage[T]]

    def __init__(
        self,
        __value: T,
        *,
        coerce: Callable[[Any], T] | None = None,
        validate: Callable[[T], T] | None = None,
    ) -> None:
        super().__init__()

        self.__network = None
        self.__id = uuid.uuid4().hex
        self.__value = __value
        self.__coerce = coerce or type(__value) if __value is not None else noop
        self.__validate = validate or noop
        self.__receivers = WeakKeyDictionary()
        self.__lazy_message = LazyMessage()

        @self.__lazy_message.configure
        def _() -> ChangeMessage[T]:
            return create_message(
                ChangeMessage[T],
                {
                    "data_id": self.id,
                    "new_value": self.__value,
                },
            )

    def __json__(self) -> ObservableSchema[T]:
        return {"data_id": self.id, "value": self.get()}

    @classmethod
    def __builtin_codegen__(cls) -> str:
        return cls.__name__

    @property
    def id(self) -> str:
        return self.__id

    def watch(
        self, __fn: ReceiverFn_t[ChangeMessage[T]]
    ) -> ReceiverFn_t[ChangeMessage[T]]:
        if __fn in self.__receivers:
            return __fn

        def __recv_watch(__change: ChangeMessage[T]) -> None:
            if __change["data_id"] != self.id:
                return
            __fn(__change)

        self.__receivers[__fn] = __recv_watch

        if self.__network is not None:
            self.__network.comm.recv(OBSERVABLE_CHANGE_MSG, __recv_watch)

        return __fn

    def unwatch(
        self, __fn: ReceiverFn_t[ChangeMessage[T]]
    ) -> ReceiverFn_t[ChangeMessage[T]]:
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

    def get(self) -> T:
        return self._get()

    def set(self, __value: T) -> None:
        try:
            __value = self.__validate(self.__coerce(__value))
        except BaseException as e:
            logger.error(e)
            __value = self.get()

        self._set(__value)
        self._emit_change()

    def _get(self) -> T:
        return self.__value

    def _set(self, __value: T) -> None:
        self.__value = __value

    def _emit_change(self) -> None:
        if self.__network is None:
            return
        self.__network.emit_change(self, self.__lazy_message)
