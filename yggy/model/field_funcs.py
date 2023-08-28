from inspect import isclass
from typing import Any, Callable, cast, overload

from ..observable import Observable
from ..observable.observable import Primitive
from .fields import (
    ObservableField,
    ObservableValueField,
    ObservableWatchField,
    SubmodelField,
    SubmodelProperty,
)
from .model import Model

__all__ = ["obs", "watch", "coerce", "validate"]


@overload
def obs[T: "Model"](__factory: type[T], **__kwds: Any) -> T:
    """Creates a `SubmodelField[T]` which describes how to
    initialize a sub-`Model` at `Model` initialization.

    Any argument assignable to the `Model` constructor can be
    passed in as additional arguments to this function.

    This actually returns a `.fields.SubmodelField[T]` rather than
    the indicated type. However, this field will be realized into
    the indicated type at `Model` initialization.

    Args:
        __factory: A subclass of `Model`
        **__kwds: Arguments used to initialize `Model`

    Returns:
        We pretend it returns `T`
        but it really returns `SubmodelField[T]`
    """
    ...


@overload
def obs[T: Primitive](__value: T) -> Observable[T]:
    """Creates an `ObservableValueField[T]` which describes how to
    initialize an `Observable[T]` at `Model` initialization.

    This actually returns a `.fields.ObservableValueField[T]` rather
    than the indicated type. However, this field will be realized
    into the indicated type at `Model` initialization.

    Args:
        __value: The initial value of the `Observable`

    Returns:
        We pretend it returns `Observable[T]`
        but it really returns `ObservableValueField[T]`
    """
    ...


def obs(__arg0: Any | type, *__args: Any, **__kwds: Any) -> Any:
    if isclass(__arg0) and issubclass(__arg0, Model):
        return SubmodelField[Any](__arg0, *__args, **__kwds)
    return ObservableValueField(__arg0)


def watch[
    T: Primitive
](
    *__observables: Observable[Any] | ObservableField[Any] | SubmodelProperty[Any],
) -> Callable[[Callable[..., T]], Observable[T]]:
    """Creates an `ObservableWatchField[T]` which describes how to
    initialize an `Observable[T]` which is automatically updated based
    on a callback function at `Model` initialization.

    Can be used for either simple callbacks that respond to the provided
    `Observable`s, or to create a computed `Observable` who's value is the
    result of that callback function.

    This actually returns a `.fields.ObservableWatchField[T]` rather
    than the indicated type. However, this field will be realized
    into the indicated type at `Model` initialization.

    Arguments:
        *__observables: The `Observable`s to watch

    Returns:
        A function which takes the callback function as it's only parameter.
        To be used as a decorator.

    Example:
    ```python
    class Person(yg.Model):
        fname = yg.obs("")
        lname = yg.obs("")

        @yg.watch(fname, lname)
        def full_name(self) -> str:
            return f"{self.fname.get()} {self.lname.get()}"
    ```
    """

    def __inner_fn(fn: Callable[..., T]) -> Observable[T]:
        observables = [obs for obs in __observables if isinstance(obs, Observable)]
        for obs in observables:

            def __fn(*__args: Any, **__kwargs: Any) -> None:
                fn()

            obs.watch(__fn)

        fields = [
            field
            for field in __observables
            if isinstance(field, (ObservableField, SubmodelProperty))
        ]
        return cast(Observable[Any], ObservableWatchField(fn, fields))

    return __inner_fn


def coerce[
    T: Primitive
](
    __obs: Observable[T] | ObservableValueField[T],
) -> Callable[
    [Callable[[Any, Any], T]], None
]:
    """Declares a custom coerce function for an `Observable`.

    Returns:
        A function which takes the coerce function as its only parameter.
        To be used as a decorator.

    Example:
    ```python
    class Foo(yg.Model):
        bar = yg.obs(0)

        @yg.coerce(bar)
        def _(self, __bar: Any) -> int:
            return int(float(__bar)) # parse float strings to int
    ```
    """
    assert isinstance(__obs, ObservableValueField)

    def __inner_fn(__fn: Callable[["Model", Any], T]) -> None:
        __obs.coerce_fn = __fn

    return __inner_fn


def validate[
    T: Primitive
](
    __obs: Observable[T] | ObservableValueField[T],
) -> Callable[
    [Callable[[Any, T], T]], None
]:
    """Declares a custom validate function for an `Observable`.

    Returns:
        A function which takes the validate function as its only parameter.
        To be used as a decorator.

    Example:
    ```python
    class Slider(yg.Model):
        min_value = yg.obs(0)
        max_value = yg.obs(100)
        value = yg.obs(0)

        @yg.validate(value)
        def _(self, __value: int) -> int:
            __value = max(__value, self.min_value.get())
            __value = min(__value, self.max_value.get())
            return __value
    ```
    """
    assert isinstance(__obs, ObservableValueField)

    def __inner_fn(__fn: Callable[["Model", T], T]) -> None:
        __obs.validate_fn = __fn

    return __inner_fn
