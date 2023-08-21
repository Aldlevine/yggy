from typing import TYPE_CHECKING, Any, cast, overload
from weakref import WeakKeyDictionary

from ..comm import ReceiverFn_t, create_message
from .messages import OBSERVABLE_CHANGE_MSG, ChangeMessage, RegisterValueMessage
from .observable import MISSING, MissingType, Observable, ObservableFactory

if TYPE_CHECKING:
    from .observable_manager import ObservableManager

__all__ = [
    "ObservableValue",
    "ObservableValueFactory",
]


class ObservableValue[T](Observable):
    __value: T
    __type: type[T]

    __receivers: WeakKeyDictionary[ReceiverFn_t, ReceiverFn_t]

    def __init__(self, __manager: "ObservableManager", __value: T) -> None:
        self.__value = __value
        self.__type = type(__value)
        self.__receivers = WeakKeyDictionary()
        super().__init__(__manager)

    @property
    def type(self) -> type[T]:
        return self.__type

    def get(self) -> T:
        return self._get()

    def set(self, __value: T) -> None:
        try:
            __value = self.__type(__value)
            old_value = self.get()
        except BaseException:
            __value = self.get()
            old_value = __value
        self._set(__value)
        self._notify_change(old_value, __value)

    def watch(self, __fn: ReceiverFn_t) -> ReceiverFn_t:
        def __recv_watch(__change: ChangeMessage[Any]) -> None:
            if __change["data_id"] != self.id:
                return
            __fn(__change)

        self.__receivers[__fn] = __recv_watch

        self._manager.comm.recv(OBSERVABLE_CHANGE_MSG, __recv_watch)

        return __fn

    def unwatch(self, __fn: ReceiverFn_t) -> ReceiverFn_t:
        if __fn in self.__receivers:
            self._manager.comm.unrecv(OBSERVABLE_CHANGE_MSG, self.__receivers[__fn])
            del self.__receivers[__fn]
        return __fn

    def __json__(self) -> dict[str, Any]:
        return cast(
            dict[str, Any],
            create_message(
                RegisterValueMessage[T],
                {"data_id": self.id, "observable_type": "value", "value": self.__value},
            ),
        )

    @overload
    def __call__(self, __value: T, /) -> None:
        ...

    @overload
    def __call__(self, /) -> T:
        ...

    def __call__(self, __value: T | None = None, /) -> T | None:
        if __value is None:
            return self.get()
        self.set(__value)

    def _get(self) -> T:
        return self.__value

    def _set(self, __value: T) -> None:
        self.__value = __value


class ObservableValueFactory[T](ObservableFactory):
    __value: T

    def __init__(self, __manager: "ObservableManager", __value: T) -> None:
        self.__value = __value
        super().__init__(__manager)

    def __call__(self, __value: T | MissingType = MISSING, *__args: Any, **__kwds: Any) -> ObservableValue[T]:
        value: T = self.__value
        if __value is not MISSING:
            value = cast(T, __value)
        return ObservableValue(self._manager, value)
