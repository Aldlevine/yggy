# from asyncio import Queue
import uuid
from typing import (
    Any,
    Callable,
    Container,
    Coroutine,
    Iterable,
    NotRequired,
    TypedDict,
    Unpack,
    cast,
    get_origin,
    overload,
)

__all__ = [
    "COMM_ADD_CLIENT_MSG",
    "COMM_REMOVE_CLIENT_MSG",
    "Comm",
    "GlobalReceiverFn_t",
    "Message",
    "ReceiverFn_t",
    "SendKwds",
    "create_message",
]

COMM_ADD_CLIENT_MSG = "comm.add_client"
COMM_REMOVE_CLIENT_MSG = "comm.remove_client"


class SendKwds(TypedDict):
    client_ids: NotRequired[Container[str] | Iterable[str]]


SenderFn_t = Callable[[str, Any, SendKwds], Coroutine[Any, Any, Any]]
ReceiverFn_t = Callable[[Any], Coroutine[Any, Any, Any]]
GlobalReceiverFn_t = Callable[[str, Any], Coroutine[Any, Any, Any]]


class Message(TypedDict, total=False):
    message_id: str


def create_message[T: Message](message_type: type[T], kwds: T) -> T:
    origin = get_origin(message_type) or message_type
    return cast(
        T,
        {
            "message_id": uuid.uuid4().hex,
            **{k: v for k, v in kwds.items() if k in origin.__annotations__.keys()},
        },
    )


class Comm:
    __id: str
    __senders: list[SenderFn_t]
    __receivers: dict[str, list[ReceiverFn_t]]
    __global_receivers: list[GlobalReceiverFn_t]
    __clients: set[str]

    # __send_queue: Queue[tuple[str, Any]]
    # __notify_queue: Queue[tuple[str, Any]]

    def __init__(self) -> None:
        self.__id = uuid.uuid4().hex
        self.__senders = []
        self.__receivers = {}
        self.__global_receivers = []
        self.__clients = set()

        # self.__send_queue = Queue()
        # self.__notify_queue = Queue()

        self.recv(COMM_ADD_CLIENT_MSG, self.__recv_add_client)
        self.recv(COMM_REMOVE_CLIENT_MSG, self.__recv_remove_client)

    @property
    def id(self) -> str:
        return self.__id

    def add_sender(self, __sender: SenderFn_t) -> None:
        if __sender not in self.__senders:
            self.__senders.append(__sender)

    def get_client_id(self) -> str:
        client_id = uuid.uuid4().hex
        return client_id

    async def add_client(self, __client_id: str) -> None:
        self.__clients.add(__client_id)
        await self.send(COMM_ADD_CLIENT_MSG, __client_id)

    async def remove_client(self, __client_id: str) -> None:
        await self.send(COMM_REMOVE_CLIENT_MSG, __client_id)
        self.__clients.discard(__client_id)

    async def send(self, msg: str, data: Any, **kwds: Unpack[SendKwds]) -> None:
        await self.notify(msg, data)
        for sender in self.__senders:
            await sender(msg, data, kwds)

    async def notify(self, msg: str, data: Any) -> None:
        for receiver in self.__global_receivers:
            await receiver(msg, data)
        receivers = self.__receivers.get(msg, [])
        for receiver in receivers:
            await receiver(data)

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

    async def __recv_add_client(self, __client: Any) -> None:
        print("ADD CLIENT", __client)
        ...

    async def __recv_remove_client(self, __client: Any) -> None:
        print("REMOVE CLIENT", __client)
        ...
