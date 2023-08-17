import asyncio
import uuid
from queue import Empty, SimpleQueue
from threading import Thread
from typing import (
    Any,
    Callable,
    Container,
    Coroutine,
    Iterable,
    TypedDict,
    Unpack,
    cast,
    get_origin,
    overload,
)

from ..logging import get_logger
from .messages import COMM_ADD_CLIENT_MSG, COMM_REMOVE_CLIENT_MSG, Message

__all__ = [
    "COMM_REMOVE_CLIENT_MSG",
    "Comm",
    "GlobalReceiverFn_t",
    "ReceiverFn_t",
    "STOP_PROPAGATION",
    "SendKwds",
    "create_message",
]

logger = get_logger(__loader__.name)


class SendKwds(TypedDict, total=False):
    local_only: bool
    client_ids: Container[str] | Iterable[str]


STOP_PROPAGATION = object()


SenderFn_t = Callable[[str, Any, SendKwds], Coroutine[Any, Any, Any]]
ReceiverFn_t = Callable[[Any], Any]
GlobalReceiverFn_t = Callable[[str, Any], Any]


def create_message[T: Message](message_type: type[T], kwds: T) -> T:
    origin = get_origin(message_type) or message_type
    return cast(
        T,
        {
            "message_id": uuid.uuid4().hex,
            "stop_propagation": False,
            **{k: v for k, v in kwds.items() if k in origin.__annotations__.keys()},
        },
    )


class Comm:
    __id: str
    __senders: list[SenderFn_t]
    __receivers: dict[str, list[ReceiverFn_t]]
    __global_receivers: list[GlobalReceiverFn_t]
    __clients: set[str]
    __msg_queue: SimpleQueue[tuple[str, Any, SendKwds]]

    def __init__(self) -> None:
        self.__id = uuid.uuid4().hex
        self.__senders = []
        self.__receivers = {}
        self.__global_receivers = []
        self.__clients = set()
        self.__msg_queue = SimpleQueue()

    @property
    def id(self) -> str:
        return self.__id

    def run(self) -> None:
        self.__loop = asyncio.new_event_loop()
        self.__loop.run_until_complete(self.__serve())

    def start(self) -> None:
        self.__thread = Thread(target=self.run, daemon=True)
        self.__thread.start()

    def stop(self) -> None:
        self.__loop.stop()

    def add_sender(self, __sender: SenderFn_t) -> None:
        if __sender not in self.__senders:
            self.__senders.append(__sender)

    def new_client_id(self) -> str:
        client_id = uuid.uuid4().hex
        return client_id

    def add_client(self, __client_id: str) -> None:
        self.__clients.add(__client_id)
        self.send(COMM_ADD_CLIENT_MSG, __client_id, local_only=True)

    def remove_client(self, __client_id: str) -> None:
        self.send(COMM_REMOVE_CLIENT_MSG, __client_id, local_only=True)
        self.__clients.discard(__client_id)

    def send(self, msg: str, data: Any, **kwds: Unpack[SendKwds]) -> None:
        self.__msg_queue.put((msg, data, kwds))

    @overload
    def recv(self, __fn: GlobalReceiverFn_t, /) -> None:
        ...

    @overload
    def recv(self, __msg: str, __fn: ReceiverFn_t, /) -> None:
        ...

    @overload
    def recv(self, /) -> Callable[[GlobalReceiverFn_t], GlobalReceiverFn_t]:
        ...

    @overload
    def recv(self, __msg: str, /) -> Callable[[ReceiverFn_t], ReceiverFn_t]:
        ...

    def recv(
        self,
        __arg0: str | GlobalReceiverFn_t | None = None,
        __arg1: ReceiverFn_t | None = None,
        /,
    ) -> (
        None
        | Callable[[ReceiverFn_t], ReceiverFn_t]
        | Callable[[GlobalReceiverFn_t], GlobalReceiverFn_t]
    ):
        # overload 1
        if isinstance(__arg0, Callable) and __arg1 is None:
            if __arg0 not in self.__global_receivers:
                self.__global_receivers.append(__arg0)
            return

        # overload 2
        if isinstance(__arg0, str) and isinstance(__arg1, Callable):
            receivers = self.__receivers.setdefault(__arg0, [])
            fn: ReceiverFn_t = __arg1
            if fn not in receivers:
                receivers.append(fn)
            return

        # overload 3
        if __arg0 is None and __arg1 is None:

            def __inner_fn_3(fn: GlobalReceiverFn_t) -> GlobalReceiverFn_t:
                if fn not in self.__global_receivers:
                    self.__global_receivers.append(fn)
                return fn

            return __inner_fn_3

        # overload 4
        if isinstance(__arg0, str) and __arg1 is None:

            def __inner_fn_4(fn: ReceiverFn_t) -> ReceiverFn_t:
                receivers = self.__receivers.setdefault(__arg0, [])
                if fn not in receivers:
                    receivers.append(fn)
                return fn

            return __inner_fn_4

    def unrecv(self, msg: str, fn: ReceiverFn_t) -> None:
        receivers = self.__receivers.get(msg, None)
        if receivers is not None:
            receivers.remove(fn)

    async def __serve(self) -> None:
        while True:
            try:
                msg, data, kwds = self.__msg_queue.get(timeout=10)
                await self.__do_send(msg, data, **kwds)
            except Empty:
                continue

    async def __do_send(self, msg: str, data: Any, **kwds: Unpack[SendKwds]) -> None:
        logger.debug(f"{msg} {data} {kwds}")

        stop_propagation = False
        for receiver in self.__global_receivers:
            if STOP_PROPAGATION == receiver(msg, data):
                stop_propagation = True

        receivers = self.__receivers.get(msg, [])
        for receiver in receivers:
            if STOP_PROPAGATION == receiver(data):
                stop_propagation = True

        if not kwds.get("local_only") and not stop_propagation:
            for sender in self.__senders:
                await sender(msg, data, kwds)
