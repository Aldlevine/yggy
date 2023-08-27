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
    """Creates a ``SubmodelField[T]`` which describes how to
    initialize a sub-``Model`` at ``Model`` initialization.

    Any argument assignable to the ``Model`` constructor can be
    passed in as additional arguments to this function.

    This actually returns a ``.fields.SubmodelField[T]`` rather than
    the indicated type. However, this field will be realized into
    the indicated type at `Model` initialization.

    Arguments:
        __factory: A subclass of ``Model``
        **__kwds: Arguments used to initialize ``Model``

    Returns:
        We pretend it returns ``T``
        but it really returns ``SubmodelField[T]``
    """
    ...


@overload
def obs[T: Primitive](__value: T) -> Observable[T]:
    """Creates an ``ObservableField[T]`` which describes how to
    initialize an ``Observable[T]`` at ``Model`` initialization.

    This actually returns a ``.fields.ObservableValueField[T]`` rather
    than the indicated type. However, this field will be realized
    into the indicated type at ``Model`` initialization.

    Arguments:
        __value: The initial value of the ``Observable``

    Returns:
        We pretend it returns ``Observable[T]``
        but it really returns ``ObservableValueField[T]``
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
    assert isinstance(__obs, ObservableValueField)

    def __inner_fn(__fn: Callable[["Model", T], T]) -> None:
        __obs.validate_fn = __fn

    return __inner_fn
