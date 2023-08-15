import uuid
from functools import partial
from typing import TYPE_CHECKING, Any, ClassVar, TypedDict, cast

from ..comm import GlobalReceiverFn_t
from .observable import MISSING, Observable, ObservableFactory
from .observable_value import ObservableValueFactory

if TYPE_CHECKING:
    from .observable_manager import ObservableManager

__all__ = [
    "ObjectModel",
    "ObservableObject",
    "ObservableObjectFactory",
]

class ObjectModel(TypedDict, total=False):
    ...

class ObservableObject[T: ObjectModel](Observable[GlobalReceiverFn_t]):
    __type_id: ClassVar[str]
    __observable_factories: ClassVar[dict[str, ObservableFactory]]

    __observables: dict[str, Observable[Any]]

    def __init_subclass__(cls) -> None:
        cls.__type_id = uuid.uuid4().hex
        cls.__observable_factories = {}
        for k, v in cls.__dict__.items():
            if isinstance(v, ObservableFactory):
                cls.__observable_factories[k] = v

    def __init__(self, __manager: "ObservableManager", __kwds: T = {}) -> None:
        self.__observables = {}

        for k, v in type(self).__dict__.items():
            if isinstance(v, ObservableValueFactory):
                v = cast(ObservableValueFactory[Any], v)
                self.__observables[k] = v(__kwds.get(k, MISSING))
            elif isinstance(v, ObservableFactory):
                self.__observables[k] = v()

        super().__init__(__manager)


    def watch(self, __fn: GlobalReceiverFn_t) -> None:
        for k, obs in self.__observables.items():
            obs.watch(partial(__fn, k))


    @property
    @classmethod
    def __type_id__(cls) -> str:
        return cls.__type_id

    def __json__(self) -> dict[str, Any]:
        return {
            "object_type": type(self).__name__,
            "id": self.id,
            "attrs": {k: v.id for k, v in self.__observables.items()},
        }
    
    def __getattribute__(self, __name: str) -> Any:
        if __name in ["_ObservableObject__observables"]:
            return super().__getattribute__(__name)
        if __name in self.__observables.keys():
            return self.__observables[__name]
        return super().__getattribute__(__name)
    

class ObservableObjectFactory[T: ObjectModel](ObservableFactory):
    __type: type[ObservableObject[T]]
    __kwds: T

    def __init__(self, __manager: "ObservableManager", __type: type[ObservableObject[T]], __kwds: T = {}) -> None:
        super().__init__(__manager)
        self.__type = __type
        self.__kwds = __kwds

    def __call__(self, kwds: T = {}) -> ObservableObject[T]:
        merged_kwds = self.__kwds.copy()
        for k, v in kwds.get("value", {}):
            if k in merged_kwds:
                merged_kwds[k] = v # type: ignore
        return self.__type(self._manager, merged_kwds)
