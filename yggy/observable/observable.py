import abc
import uuid
from typing import TYPE_CHECKING, Any, overload

from ..comm import create_message
from .messages import ChangeMessage

if TYPE_CHECKING:
    from .observable_manager import ObservableManager

__all__ = [
    "MISSING",
    "Observable",
    "ObservableFactory",
]


class Observable(abc.ABC):
    _manager: "ObservableManager"
    __data_id: str

    def __init__(self, __manager: "ObservableManager") -> None:
        super().__init__()

        self._manager = __manager
        self.__data_id = uuid.uuid4().hex

        self._manager.register(self)

    @property
    def id(self) -> str:
        return self.__data_id
    
    @overload
    @abc.abstractmethod
    def __call__(self, __value: Any, /) -> None:
        ...

    @overload
    @abc.abstractmethod
    def __call__(self, /) -> Any:
        ...

    @abc.abstractmethod
    def __call__(self, __value: Any = None, /) -> Any:
        ...

    @abc.abstractmethod
    def __json__(self) -> dict[str, Any]:
        ...

    def _notify_change[T](self, old_value: T, new_value: T) -> None:
        change = create_message(
            ChangeMessage[T],
            {
                "data_id": self.id,
                "new_value": new_value,
                "old_value": old_value,
            },
        )
        self._manager.notify_change(change)


class MissingType:
    ...


MISSING = MissingType()


class ObservableFactory(abc.ABC):
    _manager: "ObservableManager"

    def __init__(self, __manager: "ObservableManager") -> None:
        super().__init__()
        self._manager = __manager

    @abc.abstractmethod
    def __call__(self) -> Observable:
        ...
