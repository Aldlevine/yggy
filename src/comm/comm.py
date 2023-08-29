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
from ..utils.weakref import WeakMethodSet
from .lazy_message import LazyMessage
from .messages import (
    COMM_ADD_CLIENT_MSG,
    COMM_REMOVE_CLIENT_MSG,
    Message,
    ModifyClientMessage,
)

__all__ = [
    "COMM_REMOVE_CLIENT_MSG",
    "Comm",
    "GlobalReceiverFn_t",
    "ReceiverFn_t",
    "SendKwds",
    "create_message",
]

logger = get_logger(f"{__name__}")


class SendKwds(TypedDict, total=False):
    client_ids: Container[str] | Iterable[str]


type SenderFn_t[T] = Callable[[str, T, SendKwds], Coroutine[Any, Any, Any]]
type ReceiverFn_t[T] = Callable[[T], Any]
type GlobalReceiverFn_t[T] = Callable[[str, T], Any]


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
    """#Comm manages communication for all objects in yggy.

    A #Comm can send messages both locally, or locally+remote.

    Messages are notified locally immediately and synchronously,
    while messages are sent remote through an asynchronous
    message queue.

    Example:
    ```python
    import yggy as yg

    comm = yg.Comm()

    class MyMessage(yg.Message):
        data: str

    @comm.recv("my.message")
    def my_message(data: MyMessage) -> None:
        print("got data:", data["data"])

    comm.start()

    comm.send(
        "my.message",
        yg.create_message(MyMessage, {"data": "Hello, world."})
    ) # >> got data: Hello, world.
    ```
    """

    __id: str
    __senders: set[SenderFn_t[Any]]
    __receivers: dict[str, WeakMethodSet[ReceiverFn_t[Any]]]
    __global_receivers: WeakMethodSet[GlobalReceiverFn_t[Any]]
    __clients: set[str]
    __msg_queue: SimpleQueue[tuple[str, Message | LazyMessage[Any], SendKwds]]
    __revoked_msgs: set[str]

    def __init__(self) -> None:
        self.__id = uuid.uuid4().hex
        self.__senders = set()
        self.__receivers = {}
        self.__global_receivers = WeakMethodSet()
        self.__clients = set()
        self.__msg_queue = SimpleQueue()
        self.__revoked_msgs = set()

    @property
    def id(self) -> str:
        """The unique id for this #Comm instance"""

        return self.__id

    def run(self) -> None:
        """Run the message queue loop"""

        self.__loop = asyncio.new_event_loop()
        self.__loop.run_until_complete(self.__serve())

    def start(self) -> None:
        """Run the message queue loop on a separate thread"""
        self.__thread = Thread(target=self.run, daemon=True)
        self.__thread.start()

    def stop(self) -> None:
        """Stop the message queue loop"""
        self.__loop.stop()

    def add_sender(self, __sender: SenderFn_t[Message]) -> None:
        """Add a sender callback to the senders list

        Args:
            __sender: The sender callback to add
        """
        if __sender not in self.__senders:
            self.__senders.add(__sender)

    def new_client_id(self) -> str:
        """Retrieve a new client id

        Returns:
            A new client id
        """
        client_id = uuid.uuid4().hex
        return client_id

    def add_client(self, __client_id: str) -> None:
        """Add a new client to the clients list and notify

        Args:
            __client_id: The client id to add
        """
        self.__clients.add(__client_id)
        self.notify(COMM_ADD_CLIENT_MSG, ModifyClientMessage(client_id=__client_id))

    def remove_client(self, __client_id: str) -> None:
        """Remove a client from the clients list and notify

        Args:
            __client_id: The client id to remove
        """
        self.notify(COMM_REMOVE_CLIENT_MSG, ModifyClientMessage(client_id=__client_id))
        self.__clients.discard(__client_id)

    def notify(self, __msg: str, __data: Message) -> None:
        """Notify local recievers with message

        Args:
            __msg: The message to notify
            __data: The message data to notify
        """
        for receiver in self.__global_receivers:
            receiver(__msg, __data)

        receivers = self.__receivers.get(__msg, WeakMethodSet())
        for receiver in receivers:
            receiver(__data)

    def send(
        self,
        __msg: str,
        __data: Message | LazyMessage[Any],
        **__kwargs: Unpack[SendKwds],
    ) -> None:
        """Place message on message queue

        Args:
            __msg: The message to send
            __data: The message data to send
            **__kwargs: #SendKwds
                client_ids: The client ids to send to (all if blank)
        """
        if isinstance(__data, LazyMessage) and not __data.begin():
            return
        self.__msg_queue.put((__msg, __data, __kwargs))

    def emit(
        self,
        __msg: str,
        __data: Message | LazyMessage[Any],
        **__kwargs: Unpack[SendKwds],
    ) -> None:
        """Notify and send message

        Args:
            __msg: The message to emit
            __data: The message data to emit
            **__kwargs: #SendKwds
                client_ids: The client ids to send to (all if blank)
        """
        self.send(__msg, __data, **__kwargs)
        if isinstance(__data, LazyMessage):
            data = __data.peek()
        else:
            data = __data
        self.notify(__msg, data)

    def revoke(self, __id: str) -> None:
        """Mark a message as revoked. A revoked message
        will be skipped when dequeued.

        Args:
            __id: The message id to revoke
        """
        self.__revoked_msgs.add(__id)

    @overload
    def recv[T: Message](self, __fn: GlobalReceiverFn_t[T], /) -> None:
        """Add a global receiver.

        Global receivers are called for all messages.

        Args:
            __fn: The global receiver to add
        """
        ...

    @overload
    def recv[T: Message](self, __msg: str, __fn: ReceiverFn_t[T], /) -> None:
        """Add a named receiver.

        Named receivers are called for all messages
        sent to the given message name.

        Args:
            __msg: The message name
            __fn: The receiver to add
        """
        ...

    @overload
    def recv[
        T: Message
    ](self, /) -> Callable[[GlobalReceiverFn_t[T]], GlobalReceiverFn_t[T]]:
        ...

    @overload
    def recv[
        T: Message
    ](self, __msg: str, /) -> Callable[[ReceiverFn_t[T]], ReceiverFn_t[T]]:
        ...

    def recv(
        self,
        __arg0: str | GlobalReceiverFn_t[Message] | None = None,
        __arg1: ReceiverFn_t[Message] | None = None,
        /,
    ) -> (
        None
        | Callable[[ReceiverFn_t[Message]], ReceiverFn_t[Message]]
        | Callable[[GlobalReceiverFn_t[Message]], GlobalReceiverFn_t[Message]]
    ):
        # overload 1
        if isinstance(__arg0, Callable) and __arg1 is None:
            if __arg0 not in self.__global_receivers:
                self.__global_receivers.add(__arg0)
            return

        # overload 2
        if isinstance(__arg0, str) and isinstance(__arg1, Callable):
            receivers = self.__receivers.setdefault(__arg0, WeakMethodSet())
            fn: ReceiverFn_t[Any] = __arg1
            if fn not in receivers:
                receivers.add(fn)
            return

        # overload 3
        if __arg0 is None and __arg1 is None:

            def __inner_fn_3(
                fn: GlobalReceiverFn_t[Message],
            ) -> GlobalReceiverFn_t[Message]:
                if fn not in self.__global_receivers:
                    self.__global_receivers.add(fn)
                return fn

            return __inner_fn_3

        # overload 4
        if isinstance(__arg0, str) and __arg1 is None:

            def __inner_fn_4(fn: ReceiverFn_t[Message]) -> ReceiverFn_t[Message]:
                receivers = self.__receivers.setdefault(__arg0, WeakMethodSet())
                if fn not in receivers:
                    receivers.add(fn)
                return fn

            return __inner_fn_4

    # TODO: add unrecv overloads for corresponding recv overloads
    def unrecv(self, msg: str, fn: ReceiverFn_t[Message]) -> None:
        receivers = self.__receivers.get(msg, None)
        if receivers is not None:
            receivers.remove(fn)

    async def __serve(self) -> None:
        while True:
            try:
                msg, data, kwds = self.__msg_queue.get(timeout=10)
                if isinstance(data, LazyMessage):
                    data = data.complete()
                if data["message_id"] in self.__revoked_msgs:
                    self.__revoked_msgs.remove(data["message_id"])
                    continue
                await self.__do_send(msg, data, **kwds)
            except Empty:
                continue

    async def __do_send(self, msg: str, data: Any, **kwds: Unpack[SendKwds]) -> None:
        logger.debug(f"{msg} {data} {kwds}")

        coros: list[Coroutine[Any, Any, Any]] = []
        for sender in self.__senders:
            coros.append(sender(msg, data, kwds))
        await asyncio.gather(*coros)
