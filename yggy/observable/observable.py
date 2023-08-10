import abc
import uuid
from asyncio import create_task
from typing import Any, TypedDict, TYPE_CHECKING

if TYPE_CHECKING:
    from .observable_manager import ObservableManager

__all__ = [
    "ObservableChange",
    "Observable",
]

class ObservableChange[T](TypedDict):
    event_id: str
    data_id: str
    old_value: T
    new_value: T


class Observable[T](abc.ABC):
    __manager: "ObservableManager"
    __data_id: str

    def __init__(self, __manager: "ObservableManager") -> None:
        super().__init__()

        self.__manager = __manager
        self.__data_id = uuid.uuid4().hex

        self.__manager.register(self)

    @property
    def id(self) -> str:
        return self.__data_id
    
    @property
    def value(self) -> T:
        return self.get()
    
    @value.setter
    def value(self, __value: T) -> None:
        self.set(__value)

    def get(self) -> T:
        return self._get()
    
    @abc.abstractmethod
    def _get(self) -> T:
        ...

    def set(self, __value: T) -> None:
        old_value = self.get()
        new_value = __value
        self._set(__value)
        create_task(self.__notify_change(old_value, new_value))

    async def set_async(self, __value: T) -> None:
        old_value = self.get()
        new_value = __value
        self._set(__value)
        await self.__notify_change(old_value, new_value)

    @abc.abstractmethod
    def _set(self, __value: T) -> None:
        ...

    @abc.abstractmethod
    def __json__(self) -> dict[str, Any]:
        ...

    async def __notify_change(self, old_value: T, new_value: T) -> None:
        change = ObservableChange(
            event_id=uuid.uuid4().hex,
            data_id=self.id,
            old_value=old_value,
            new_value=new_value,
        )
        await self.__manager.notify_change(change)
