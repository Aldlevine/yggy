from typing import TYPE_CHECKING, Any, cast

from yggy.observable.observable import Observable

from ..comm import ReceiverFn_t
from .messages import OBSERVABLE_CHANGE_MSG
from .observable import (
    MISSING,
    MissingType,
    Observable,
    ObservableChangeMessage,
    ObservableFactory,
)

if TYPE_CHECKING:
    from .observable_manager import ObservableManager

__all__ = [
    "ObservableValue",
    "ObservableValueFactory",
]


class ObservableValue[T](Observable[Any]):
    __value: T
    __type: type[T]

    def __init__(self, __manager: "ObservableManager", __value: T) -> None:
        super().__init__(__manager)
        self.__value = __value
        self.__type = type(__value)

    @property
    def type(self) -> type[T]:
        return self.__type

    @property
    def value(self) -> T:
        return self.get()

    @value.setter
    def value(self, __value: T) -> None:
        self.set(__value)

    def get(self) -> T:
        return self._get()

    def set(self, __value: T) -> None:
        old_value = self.get()
        new_value = __value
        self._set(__value)
        self._notify_change(old_value, new_value)

    def watch(self, __fn: ReceiverFn_t) -> None:
        def __recv_watch(__change: ObservableChangeMessage[Any]) -> None:
            if __change["data_id"] != self.id:
                return
            __fn(__change)

        self._manager.comm.recv(OBSERVABLE_CHANGE_MSG, __recv_watch)

    def __json__(self) -> dict[str, Any]:
        return {"value_type": self.type.__name__, "id": self.id, "value": self.get()}

    def _get(self) -> T:
        return self.__value

    def _set(self, __value: T) -> None:
        self.__value = __value


class ObservableValueFactory[T](ObservableFactory):
    __value: T

    def __init__(self, __manager: "ObservableManager", __value: T) -> None:
        self.__value = __value
        super().__init__(__manager)

    def __call__(self, __value: T | MissingType = MISSING) -> ObservableValue[T]:
        value: T = self.__value
        if __value is not MISSING:
            value = cast(T, __value)
        return ObservableValue(self._manager, value)
