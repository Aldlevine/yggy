import uuid
from functools import partial
from typing import TYPE_CHECKING, Any, ClassVar, cast, dataclass_transform

from ..comm import GlobalReceiverFn_t, create_message
from .messages import RegisterObjectMessage
from .observable import MISSING, Observable, ObservableFactory
from .observable_value import ObservableValueFactory

if TYPE_CHECKING:
    from .observable_manager import ObservableManager

__all__ = [
    "ObservableObject",
    "ObservableObjectFactory",
]


@dataclass_transform(eq_default=False)
class ObservableObject(Observable[GlobalReceiverFn_t]):
    __type_id: ClassVar[str]
    __observable_factories: ClassVar[dict[str, ObservableFactory]]

    __observables: dict[str, Observable[Any]]

    def __init_subclass__(cls) -> None:
        cls.__type_id = uuid.uuid4().hex
        cls.__observable_factories = {}
        for k, v in cls.__dict__.items():
            if isinstance(v, ObservableFactory):
                cls.__observable_factories[k] = v

    def __init__(self, __manager: "ObservableManager", **__kwds: Any) -> None:
        self.__observables = {}

        for k, v in type(self).__dict__.items():
            if isinstance(v, ObservableValueFactory):
                v = cast(ObservableValueFactory[Any], v)
                self.__observables[k] = v(__kwds.get(k, MISSING))
            elif isinstance(v, ObservableFactory):
                self.__observables[k] = v()

        super().__init__(__manager)
        self.__post_init__()

    def __post_init__(self) -> None:
        ...

    def watch(self, __fn: GlobalReceiverFn_t) -> GlobalReceiverFn_t:
        for k, obs in self.__observables.items():
            obs.watch(partial(__fn, k))
        return __fn

    @property
    @classmethod
    def __type_id__(cls) -> str:
        return cls.__type_id

    def __call__(self, args: Any = None) -> Any:
        ...

    def __json__(self) -> dict[str, Any]:
        attrs = {k: v.id for k, v in self.__observables.items()}
        return cast(
            dict[str, Any],
            create_message(
                RegisterObjectMessage,
                {"data_id": self.id, "observable_type": "object", "attrs": attrs},
            ),
        )

    def __getattribute__(self, __name: str) -> Any:
        if __name.endswith("__observables"):
            return super().__getattribute__(__name)
        if __name in self.__observables.keys():
            return self.__observables[__name]
        return super().__getattribute__(__name)


class ObservableObjectFactory(ObservableFactory):
    __type: type[ObservableObject]
    __kwds: dict[str, Any]

    def __init__(
        self,
        __manager: "ObservableManager",
        __type: type[ObservableObject],
        **__kwds: Any,
    ) -> None:
        super().__init__(__manager)
        self.__type = __type
        self.__kwds = __kwds

    def __call__(self, **kwds: Any) -> ObservableObject:
        merged_kwds = self.__kwds.copy()
        for k, v in kwds.items():
            if k in merged_kwds:
                merged_kwds[k] = v
        return self.__type(self._manager, **merged_kwds)
