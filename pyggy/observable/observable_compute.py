from functools import partial
from typing import Any, Callable, Generic, TypeVar, TypeVarTuple, cast

from .observable_base import Change, Observable, ObservableFactory
from .observable_object import ObservableObject

__all__ = [
    "ObservableCompute",
    "ObservableComputeFactory",
    "compute",
]

T = TypeVar("T")
TT = TypeVarTuple("TT")


class ObservableCompute(Generic[*TT, T], Observable[T]):
    _fn: Callable[[*TT], T]
    _dependencies: list[Observable[Any]]
    _value: T

    def __init__(
        self,
        factory_id: str,
        fn: Callable[[*TT], T],
        dependencies: list[Observable[Any]],
    ) -> None:
        super().__init__(factory_id)
        self._fn = fn
        self._dependencies = dependencies
        for dependency in dependencies:
            dependency.watch(self._handle_dependency_change)
        self._value = self._compute()

    def _compute(self) -> T:
        return self._fn(*[d.value for d in self._dependencies])  # type: ignore[unpackedArgWithVariadicParam]

    def _handle_dependency_change(self, change: Change[Any]) -> None:
        old_value = self._value
        new_value = self._value = self._compute()
        self.notify(Change(id=self.id, old_value=old_value, new_value=new_value))

    @property
    def value(self) -> T:
        return self._value

    @value.setter
    def value(self, new_value: T) -> None:
        ...


class ObservableComputeFactory(Generic[*TT, T], ObservableFactory):
    _fn: Callable[[Any, *TT], T]
    _dependencies: list[ObservableFactory]

    def __init__(
        self, fn: Callable[[Any, *TT], T], dependencies: list[ObservableFactory]
    ) -> None:
        super().__init__()
        self._fn = fn
        self._dependencies = dependencies

    def __call__(self, parent: "ObservableObject[Any]", **kwds: Any) -> Any:
        dependencies: list[Observable[Any]] = []
        for dependency in self._dependencies:
            factory_id = dependency.id
            for observable in parent.observables.values():
                if observable.factory_id == factory_id:
                    dependencies.append(observable)
        computed = ObservableCompute[*TT, T](
            self.id, partial(self._fn, parent), dependencies
        )
        return computed


def compute(*dependencies: *TT) -> Callable[[Callable[[Any, *TT], T]], T]:
    def inner(fn: Callable[[Any, *TT], T]) -> T:
        return cast(
            T, ObservableComputeFactory(fn, cast(list[ObservableFactory], dependencies))
        )

    return inner
