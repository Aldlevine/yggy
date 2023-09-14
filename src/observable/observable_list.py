from typing import Any, Callable, cast

from .schema import ObservableListSchema

from ..comm import create_message
from .messages import ListChangeMessage
from .observable_base import ObservableBase

__all__ = ["ObservableList"]


def or_default[T](v: T | None, d: T) -> T:
    if v is None:
        return d
    return v


class ObservableList[T](ObservableBase[ObservableListSchema[T], ListChangeMessage[T]]):
    __list: list[T]
    __coerce: Callable[[Any], T] | None
    __validate: Callable[[T], T] | None

    def __init__(
        self,
        *,
        coerce: Callable[[Any], T] | None = None,
        validate: Callable[[T], T] | None = None,
    ):
        super().__init__()
        self.__list = []
        self.__coerce = coerce
        self.__validate = validate

    # Dunder methods for list-like syntax
    def __len__(self) -> int:
        return len(self.__list)

    def __getitem__(self, index: int | slice):
        if isinstance(index, slice):
            return self.__list[index.start : index.stop : index.step]
        return self.__list[index]

    def __setitem__(self, index: int | slice, value: T | list[T]):
        if isinstance(index, slice):
            value = cast(list[T], value)
            self.__apply_slice(index, value)
        else:
            value = cast(T, value)
            self.__apply_changes(inserts={index: value}, removes=[index])

    def load_schema(self, schema: ObservableListSchema[T]) -> None:
        self[:] = schema["list"]

    def __json__(self) -> ObservableListSchema[T]:
        return {"data_id": self.id, "list": self.__list}

    # Higher-level methods
    def append(self, item: T):
        self.__apply_changes(inserts={len(self.__list): item})

    def pop(self, index: int = -1):
        item = self.__list[index]
        self.__apply_changes(removes=[index])
        return item

    def extend(self, items: list[T]):
        start = len(self.__list)
        self.__apply_changes(inserts={start + i: item for i, item in enumerate(items)})

    def clear(self):
        self.__apply_changes(removes=list(range(len(self.__list))))

    def insert(self, index: int, item: T):
        self.__apply_changes(inserts={index: item})

    def remove(self, index: int):
        self.__apply_changes(removes=[index])

    def _handle_client_change(self, change: ListChangeMessage[T]) -> None:
        # return super()._handle_client_change(change)
        self.__apply_changes(change["inserts"], change["removes"])

    def __apply_slice(self, slice_obj: slice, items: list[T]):
        start = or_default(slice_obj.start, 0)
        stop = or_default(slice_obj.stop, len(self.__list))
        step = or_default(slice_obj.step, 1)
        indices_to_remove = list(range(start, stop, step))
        indices_to_insert = list(
            range(start, start + len(items) * abs(step), abs(step))
        )

        if step < 0:
            indices_to_remove.reverse()
            indices_to_insert.reverse()

        inserts = {index: item for index, item in zip(indices_to_insert, items)}
        self.__apply_changes(inserts=inserts, removes=indices_to_remove)

    def __apply_changes(
        self,
        inserts: dict[int, T] | None = None,
        removes: list[int] | None = None,
    ):
        message = create_message(
            ListChangeMessage[T],
            {
                "data_id": self.id,
                "inserts": {},
                "removes": [],
            },
        )

        new_list = [*self.__list]
        if removes:
            for index in sorted(removes, reverse=True):
                # self.__list.pop(index)
                new_list.pop(index)
            message["removes"] = removes

        if inserts:
            for index, item in sorted(inserts.items()):
                # self.__list.insert(index, item)
                new_list.insert(int(index), item)
            message["inserts"] = inserts

        self.__list = new_list
        if self.network is not None:
            self.network.emit_change(self, message)
