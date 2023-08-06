from typing import Any, Generic, TypeVar, cast

from .observable_base import Change, Observable, ObservableFactory, ValidateFn_t
from .observable_object import ObservableObject

__all__ = [
    "ObservableValue",
    "ObservableValueFactory",
    "default_validate_fn",
    "value",
]

T = TypeVar("T")


def default_validate_fn(change: Change[T]) -> T:
    return change["new_value"]


class ObservableValue(Generic[T], Observable[T]):
    _value: T

    def __init__(
        self,
        factory_id: str,
        value: T,
        validate: ValidateFn_t[T] = default_validate_fn,
    ) -> None:
        super().__init__(factory_id)
        self._value = value
        self._validate = validate

    @property
    def value(self) -> T:
        return self._value

    @value.setter
    def value(self, new_value: T) -> None:
        old_value = self._value

        change = Change(
            id=self.id,
            old_value=old_value,
            new_value=new_value,
        )

        self._value = change["new_value"] = self._validate(change)

        self.notify(change)


class ObservableValueFactory(Generic[T], ObservableFactory):
    _id: str
    _value: T
    _validate: ValidateFn_t[T]

    def __init__(
        self, value: T, validate: ValidateFn_t[T] = default_validate_fn
    ) -> None:
        super().__init__()
        self._value = value
        self._validate = validate

    def __call__(self, parent: "ObservableObject[Any]", **kwds: Any) -> Any:
        if "value" in kwds:
            value = kwds["value"]
        else:
            value = self._value
        return ObservableValue[T](self._id, value, self._validate)


def value(obj: T, validate: ValidateFn_t[T] = default_validate_fn) -> T:
    return cast(T, ObservableValueFactory[T](obj, validate))
