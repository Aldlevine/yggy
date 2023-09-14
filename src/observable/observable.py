from typing import Any, Callable, cast

from ..comm import LazyMessage, create_message
from ..logging import get_logger
from ..utils.functools import noop
from .messages import BaseChangeMessage, ChangeMessage
from .observable_base import ObservableBase
from .schema import ObservableSchema

__all__ = [
    "Observable",
    "get",
]

logger = get_logger(f"{__name__}")


def get[T](obs: "Observable[T] | T") -> T:
    if isinstance(obs, Observable):
        obs = cast(Observable[T], obs)
        return obs.get()
    return obs


class Observable[T](ObservableBase[ObservableSchema[T], ChangeMessage[T]]):
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

    __value: T
    __coerce: Callable[[Any], T]
    __validate: Callable[[T], T]
    __lazy_message: LazyMessage[ChangeMessage[T]]

    def __init__(
        self,
        __value: T,
        *,
        coerce: Callable[[Any], T] | None = None,
        validate: Callable[[T], T] | None = None,
    ) -> None:
        super().__init__()

        self.__value = __value
        self.__coerce = coerce or type(__value) if __value is not None else noop
        self.__validate = validate or noop
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

    def load_schema(self, schema: ObservableSchema[T]) -> None:
        self.set(schema["value"])
        # return super().load_schema(schema)

    def __json__(self) -> ObservableSchema[T]:
        return {"data_id": self.id, "value": self.get()}

    def _handle_client_change(self, change: ChangeMessage[T]) -> None:
        self.set(change["new_value"])

    def get(self) -> T:
        return self.__get()

    def set(self, __value: T) -> None:
        try:
            __value = self.__validate(self.__coerce(__value))
        except BaseException as e:
            logger.error(e)
            __value = self.get()

        self.__set(__value)
        self.__emit_change()

    def __get(self) -> T:
        return self.__value

    def __set(self, __value: T) -> None:
        self.__value = __value

    def __emit_change(self) -> None:
        if self.network is None:
            return
        self.network.emit_change(
            self, cast(LazyMessage[BaseChangeMessage], self.__lazy_message)
        )
