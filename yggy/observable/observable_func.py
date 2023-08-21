from typing import TYPE_CHECKING, Any, Callable, cast, overload

from .messages import ChangeMessage
from .observable import ObservableFactory
from .observable_value import ObservableValue, ObservableValueFactory

if TYPE_CHECKING:
    from .observable_object import ObservableObject
    from .observable_manager import ObservableManager

__all__ = [
    "ObservableFunc",
    "ObservableFuncFactory",
]


class ObservableFunc[T](ObservableValue[T]):
    __obj: "ObservableObject"
    __deps: tuple[ObservableValue[Any], ...]
    __fn: Callable[[*tuple[Any, ...]], T]

    # def __init__(self, __manager: "ObservableManager", *__deps: ObservableValue[Any], __fn: Callable[[], T]) -> None:
    def __init__(self, __manager: "ObservableManager", __obj: "ObservableObject", __fn: Callable[[*tuple[Any, ...]], T], *__deps: ObservableValue[Any]) -> None:
        deps = cast(tuple[Any, ...], __deps)
        value = __fn(__obj)
        super().__init__(__manager, value)
        for dep in deps:
            if isinstance(dep, ObservableValue):
                dep.watch(self.__update)
        self.__obj = __obj
        self.__deps = deps
        self.__fn = __fn
            
    def __update(self, __change: ChangeMessage[Any]) -> None:
        self.set(self.__fn(self.__obj))

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


class ObservableFuncFactory[T](ObservableFactory):
    __deps: tuple[ObservableValueFactory[Any], ...]
    __fn: Callable[[*tuple[Any, ...]], T]

    def __init__(self, __manager: "ObservableManager", __fn: Callable[[*tuple[Any, ...]], T], *__deps: ObservableValueFactory[Any]) -> None:
        self.__deps = __deps
        self.__fn = __fn
        super().__init__(__manager)

    # __obj is actually required
    def __call__(self, __obj: "ObservableObject" = ..., *__args: Any, **__kwds: Any) -> ObservableFunc[T]:
        deps: list[ObservableValue[Any]] = [
            d for df in self.__deps
            if (d := __obj.find_factory_observable(df)) and isinstance(d, ObservableValue)
        ]
        return ObservableFunc[T](
            self._manager,
            __obj,
            self.__fn,
            *deps,
        )
