from typing import Literal

from ..comm import Message

OBSERVABLE_CHANGE_MSG = "observable.change"
OBSERVABLE_CLIENT_CHANGE_MSG = "observable.client_change"
OBSERVABLE_READY_MSG = "observable.ready"
OBSERVABLE_REGISTER_MSG = "observable.register"


class ChangeMessage[T](Message):
    data_id: str
    old_value: T
    new_value: T


class ClientChangeMessage[T](ChangeMessage[T]):
    ...


class RegisterMessage[T: Literal["value", "object"]](Message):
    observable_type: T
    data_id: str

class RegisterValueMessage[T](RegisterMessage[Literal["value"]]):
    value: T

class RegisterObjectMessage(RegisterMessage[Literal["object"]]):
    attrs: dict[str, str]

class ReadyMessage(Message):
    client_id: str
