from typing import Callable

from .messages import Message


class LazyMessage[T: Message]:
    __in_queue: bool
    __fn: Callable[[], T]

    def __init__(self) -> None:
        self.__in_queue = False
        pass

    @property
    def in_queue(self) -> bool:
        return self.__in_queue

    def begin(self) -> bool:
        if self.__in_queue:
            return False

        self.__in_queue = True

        return True

    def peek(self) -> T:
        return self.__fn()

    def complete(self) -> T:
        self.__in_queue = False
        return self.__fn()

    def configure(self, __fn: Callable[[], T]) -> Callable[[], T]:
        self.__fn = __fn
        return __fn
