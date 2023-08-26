from enum import Enum
from inspect import signature
from typing import Any, Callable

__all__ = ["fn_type", "bind_fn"]


class _FnType(Enum):
    FREE = 1
    METHOD = 2
    CLASS_METHOD = 3


def fn_type(fn: Callable[..., Any]) -> _FnType:
    """Determines if a function should be treated as:
    - a free function (1st parameter neither `self` or `cls`)
    - a method (p1 `self`)
    - a class method (p1 `cls`)
    It's a highly opinionated function that makes many assumptions

    Args:
        fn: The function to check

    Returns:
        an enum classification
    """

    try:
        sig = signature(fn)
    except ValueError:
        # assume if not a proper fn, must be free
        return _FnType.FREE

    try:
        p1 = list(sig.parameters.values()).pop(0)
    except:
        # assume no params, must be free
        return _FnType.FREE

    if p1.name == "self":
        # assume if p1 is named "self" this is instance method
        return _FnType.METHOD
    if p1.name == "cls":
        # assume if p1 is named "cls" this is class method
        return _FnType.CLASS_METHOD

    # assume otherwise free
    return _FnType.FREE


def bind_fn(fn: Callable[..., Any], self: object) -> Callable[..., Any]:
    """Given an unbound function, binds it to the given `self` object (if applicable).
    This is used to normalize free function / method / class method calls downstream.

    Args:
        fn: The function to bind
        self: The object to bind to

    Returns:
        The bound (or original) function
    """

    match fn_type(fn):
        case _FnType.FREE:
            return fn

        case _FnType.METHOD:

            def __inner_fn(*args: Any, **kwargs: Any) -> Any:
                return fn(self, *args, **kwargs)

            return __inner_fn

        case _FnType.CLASS_METHOD:

            def __inner_fn(*args: Any, **kwargs: Any) -> Any:
                return fn(type(self), *args, **kwargs)

            return __inner_fn


def noop[T](__x: T) -> T:
    return __x
