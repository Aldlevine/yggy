import abc
import uuid
from typing import TYPE_CHECKING, Any

from ..comm.comm import GlobalReceiverFn_t

from ..comm import Message, ReceiverFn_t, create_message

if TYPE_CHECKING:
    from .observable_manager import ObservableManager

__all__ = [
    "ObservableChangeMessage",
    "Observable",
]


class ObservableChangeMessage[T](Message):
    data_id: str
    old_value: T
    new_value: T


class Observable[F: ReceiverFn_t | GlobalReceiverFn_t](abc.ABC):
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

    @abc.abstractmethod
    def __json__(self) -> dict[str, Any]:
        ...

    @abc.abstractmethod
    def watch(self, __fn: F) -> None:
        ...

    async def _notify_change[T](self, old_value: T, new_value: T) -> None:
        change = create_message(
            ObservableChangeMessage[T],
            {
                "data_id": self.id,
                "new_value": new_value,
                "old_value": old_value,
            },
        )
        await self._manager.notify_change(change)
        

class MissingType:
    ...


MISSING = MissingType()


class ObservableFactory(abc.ABC):
    _manager: "ObservableManager"

    def __init__(self, __manager: "ObservableManager") -> None:
        super().__init__()
        self._manager = __manager

    @abc.abstractmethod
    def __call__(self) -> Observable[Any]:
        ...
