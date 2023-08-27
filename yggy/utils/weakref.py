import weakref
from inspect import ismethod
from typing import Any, Callable, Iterator

__all__ = ["WeakMethodSet"]


class WeakMethodSet[T: Callable[..., Any]]:
    __hashset: dict[int, weakref.ref[T]]

    def __init__(self) -> None:
        self.__hashset = {}

    def __make_ref(self, __element: T) -> weakref.ref[T]:
        if ismethod(__element):
            return weakref.WeakMethod(__element, self.__finalize_ref)
        return weakref.ref(__element, self.__finalize_ref)

    def __finalize_ref(self, ref: weakref.ref[T]) -> None:
        del self.__hashset[hash(ref)]

    def add(self, __element: T) -> None:
        ref = self.__make_ref(__element)
        self.__hashset[hash(ref)] = ref

    def remove(self, __element: T) -> None:
        ref = self.__make_ref(__element)
        del self.__hashset[hash(ref)]

    def __iter__(self) -> Iterator[T]:
        for v in self.__hashset.values():
            element = v()
            if element is not None:
                yield element
