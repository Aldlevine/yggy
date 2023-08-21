import uuid
from functools import partial
from typing import (
    TYPE_CHECKING,
    Any,
    Callable,
    ClassVar,
    cast,
    dataclass_transform,
    overload,
)

from ..comm import GlobalReceiverFn_t, ReceiverFn_t, create_message
from ..logging import get_logger
from .messages import RegisterObjectMessage
from .observable import MISSING, Observable, ObservableFactory
from .observable_value import ObservableValue, ObservableValueFactory

logger = get_logger(f"{__package__}.{__name__}")

if TYPE_CHECKING:
    from .observable_manager import ObservableManager

__all__ = [
    "ObservableObject",
    "ObservableObjectFactory",
]


@dataclass_transform(eq_default=False)
class ObservableObject(Observable):
    __type_id: ClassVar[str]
    __observable_factories: ClassVar[dict[str, ObservableFactory]]

    __receivers: dict[str, list[ReceiverFn_t]]
    _observables: dict[str, Observable]

    def __init_subclass__(cls) -> None:
        cls.__type_id = uuid.uuid4().hex
        cls.__observable_factories = {}
        for k, v in cls.__dict__.items():
            if isinstance(v, ObservableFactory):
                cls.__observable_factories[k] = v

    def __init__(self, __manager: "ObservableManager", **__kwds: Any) -> None:
        # we do this in case we want to preset observables in a subclass
        # idk if there's a better solution here
        setattr(self, "_observables", getattr(self, "_observables", {}))

        self.__receivers = {}
        for k, v in type(self).__dict__.items():
            if isinstance(v, ObservableValueFactory):
                v = cast(ObservableValueFactory[Any], v)
                self._observables[k] = v(__kwds.get(k, MISSING))
            elif isinstance(v, ObservableFactory):
                self._observables[k] = v()

        super().__init__(__manager)
        self.__post_init__()

    def __post_init__(self) -> None:
        ...

    @overload
    def watch(self, __attr: str) -> Callable[[ReceiverFn_t], ReceiverFn_t]:
        ...

    @overload
    def watch(
        self, __attr: str, __fn: ReceiverFn_t
    ) -> Callable[[ReceiverFn_t], ReceiverFn_t]:
        ...

    def watch(
        self, __attr: str, __fn: ReceiverFn_t | None = None
    ) -> ReceiverFn_t | Callable[[ReceiverFn_t], ReceiverFn_t]:
        if __fn is None:
            return partial(self.watch, __attr)

        receivers = self.__receivers.setdefault(__attr, [])
        receivers.append(__fn)
        attr_obs = self._observables[__attr]
        if isinstance(attr_obs, ObservableValue):
            attr_obs.watch(__fn)
        return __fn

    def unwatch(self, __fn: GlobalReceiverFn_t) -> GlobalReceiverFn_t:
        logger.warn("unwatch ObservableObject not implemented")
        return __fn

    def close(self) -> None:
        self._manager.unregister(self)
        for attr, receivers in self.__receivers.items():
            for receiver in receivers:
                attr_obs = self._observables[attr]
                if isinstance(attr_obs, ObservableValue):
                    attr_obs.unwatch(receiver)
                if isinstance(attr_obs, ObservableObject):
                    attr_obs.close()
            receivers.clear()
        self.__receivers.clear()

    @property
    @classmethod
    def __type_id__(cls) -> str:
        return cls.__type_id

    def __call__(self, args: Any = None) -> Any:
        ...

    def __json__(self) -> dict[str, Any]:
        attrs = {k: v.id for k, v in self._observables.items()}
        return cast(
            dict[str, Any],
            create_message(
                RegisterObjectMessage,
                {"data_id": self.id, "observable_type": "object", "attrs": attrs},
            ),
        )

    def __getattribute__(self, __name: str) -> Any:
        if __name == "__dict__":
            return super().__getattribute__(__name)
        if __name.endswith("_observables"):
            return super().__getattribute__(__name)
        if __name in self._observables.keys():
            return self._observables[__name]
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
