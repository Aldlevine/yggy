import abc
import uuid
from typing import (
    TYPE_CHECKING,
    Any,
    Callable,
    ClassVar,
    Generic,
    Self,
    TypedDict,
    TypeVar,
)

from ..comm import get_global_comm

if TYPE_CHECKING:
    from .observable_object import ObservableObject

__all__ = [
    "Change",
    "Observable",
    "ObservableFactory",
    "ObserverFn_t",
    "ValidateFn_t",
]

T = TypeVar("T")


class Change(TypedDict, Generic[T]):
    id: str
    old_value: T
    new_value: T


ObserverFn_t = Callable[[Change[T]], Any]
ValidateFn_t = Callable[[Change[T]], T]


if TYPE_CHECKING:

    class ObservableMeta(abc.ABCMeta):
        ...

else:

    class ObservableMeta(abc.ABCMeta):
        def __call__(self, *args: Any, **kwds: Any) -> Self:
            obj = super().__call__(*args, **kwds)
            Observable.register(obj)
            return obj


class Observable(Generic[T], abc.ABC, metaclass=ObservableMeta):
    _observable_registry: ClassVar[dict[str, "Observable[Any]"]] = {}
    # _observable_registry: ClassVar[WeakValueDictionary[str, "Observable[Any]"]] = (
    #     WeakValueDictionary()
    # )

    _factory_id: str
    _id: str
    _observers: set[ObserverFn_t[T]]
    _notifying: bool

    def __init__(self, factory_id: str) -> None:
        super().__init__()
        self._factory_id = factory_id
        self._id = uuid.uuid4().hex
        self._observers = set()
        self._notifying = False

    def __repr__(self) -> str:
        return f"{type(self).__name__}({self.value})"

    @property
    def factory_id(self) -> str:
        return self._factory_id

    @property
    def id(self) -> str:
        return self._id

    @property
    @abc.abstractmethod
    def value(self) -> T:
        ...

    @value.setter
    def value(self, new_value: T) -> None:
        ...

    def watch(self, observer: ObserverFn_t[T], /) -> None:
        self._observers.add(observer)

    def unwatch(self, observer: ObserverFn_t[T], /) -> None:
        self._observers.remove(observer)

    def notify(self, change: Change[T]) -> None:
        if self._notifying:
            return

        self._notifying = True

        for observer in self._observers:
            observer(change)

        get_global_comm().send("change", change)

        self._notifying = False

    @classmethod
    def send_registered(cls, *, sid: str | None = None) -> None:
        comm = get_global_comm()
        for observable in cls._observable_registry.values():
            comm.send("register", observable.id, observable.value, sid=sid)

    @classmethod
    def register(cls, observable: "Observable[Any]") -> None:
        cls._observable_registry[observable.id] = observable
        get_global_comm().send("register", observable.id, observable.value)

    @classmethod
    def unregister(cls, observable: "Observable[Any]") -> None:
        if observable.id not in cls._observable_registry:
            return
        del cls._observable_registry[observable.id]
        get_global_comm().send("unregister", observable.id)

    @classmethod
    def get(cls, id: str) -> "Observable[Any]":
        return cls._observable_registry[id]


class ObservableFactory(abc.ABC):
    _id: str
    _type: type

    def __init__(self) -> None:
        self._id = uuid.uuid4().hex

    @property
    def id(self) -> str:
        return self._id

    @property
    def type(self) -> type:
        return self._type

    @type.setter
    def type(self, t: "type") -> None:
        self._type = t

    @abc.abstractmethod
    def __call__(self, parent: "ObservableObject[Any]", **kwds: Any) -> Any:
        ...
