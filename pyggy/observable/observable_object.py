from typing import Any, Callable, Self, overload

from .observable_base import Change, Observable, ObservableFactory

__all__ = [
    "ObservableObject",
]


class ObservableObject(Observable[Self]):
    _observables: dict[str, Observable[Any]]

    @classmethod
    @property
    def observable_factories(cls) -> dict[str, ObservableFactory]:
        return {
            k: v for k, v in cls.__dict__.items() if isinstance(v, ObservableFactory)
        }

    def __init_subclass__(cls) -> None:
        for c in reversed(cls.mro()):
            if issubclass(c, ObservableObject):
                for k, v in cls.observable_factories.items():
                    v.type = c.__annotations__.get(k, Any)

    def __init__(self, **kwargs: Any) -> None:
        self._observables = {}
        super().__init__("")

        for cls in reversed(type(self).mro()):
            if issubclass(cls, ObservableObject):
                for k, v in cls.observable_factories.items():
                    if k in kwargs:
                        self._observables[k] = v(self, value=kwargs[k])
                    else:
                        self._observables[k] = v(self)

                    self._observables[k].watch(self._handle_child_change)

    def __getattribute__(self, __name: str) -> Any:
        observables = super().__getattribute__("_observables")
        if __name in observables:
            return observables[__name].value
        return super().__getattribute__(__name)

    def __setattr__(self, __name: str, __value: Any) -> None:
        if __name == "_observables" or __name not in self._observables:
            super().__setattr__(__name, __value)
            return
        self._observables[__name].value = __value

    def __repr__(self) -> str:
        lines = [f"{type(self).__name__}"]
        for k, o in self._observables.items():
            lines.append(f"  {k}: {repr(o.value)}")
        return "\n".join(lines)

    def toJson(self) -> str:
        return self.id

    def _handle_child_change(self, change: Change[Any]) -> None:
        self.notify(change)

    @property
    def value(self) -> Self:
        return self

    @value.setter
    def value(self, new_value: Self) -> None:
        ...

    @property
    def observables(self) -> dict[str, Observable[Any]]:
        return self._observables

    @overload
    def watch(self, key: str, observer: Callable[[Change[Any]], Any], /) -> None:
        ...

    @overload
    def watch(self, observer: Callable[[Change[Any]], Any], /) -> None:
        ...

    def watch(
        self,
        arg0: str | Callable[[Change[Any]], Any],
        arg1: Callable[[Change[Any]], Any] | None = None,
        /,
    ) -> None:
        if isinstance(arg0, str):
            assert isinstance(arg1, Callable)
            self.observables[arg0].watch(arg1)
        else:
            super().watch(arg0)
