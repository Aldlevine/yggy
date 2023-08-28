from enum import Enum
from inspect import signature
from typing import Any, Callable

__all__ = ["fn_type", "bind_fn"]


class FnType(Enum):
    FREE_FUNCTION = 1
    """The function has no member argument"""
    INSTANCE_METHOD = 2
    """The function has a `self` member argument"""
    CLASS_METHOD = 3
    """The function has a `cls` member argument"""


def fn_type(fn: Callable[..., Any]) -> FnType:
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
        return FnType.FREE_FUNCTION

    try:
        p1 = list(sig.parameters.values()).pop(0)
    except:
        # assume no params, must be free
        return FnType.FREE_FUNCTION

    if p1.name == "self":
        # assume if p1 is named "self" this is instance method
        return FnType.INSTANCE_METHOD
    if p1.name == "cls":
        # assume if p1 is named "cls" this is class method
        return FnType.CLASS_METHOD

    # assume otherwise free
    return FnType.FREE_FUNCTION


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
        case FnType.FREE_FUNCTION:
            return fn

        case FnType.INSTANCE_METHOD:

            def __inner_fn(*args: Any, **kwargs: Any) -> Any:
                return fn(self, *args, **kwargs)

            return __inner_fn

        case FnType.CLASS_METHOD:

            def __inner_fn(*args: Any, **kwargs: Any) -> Any:
                return fn(type(self), *args, **kwargs)

            return __inner_fn


def noop[T](__x: T) -> T:
    return __x
