from ..comm import Message

OBSERVABLE_CHANGE_MSG = "observable.change"
OBSERVABLE_CLIENT_CHANGE_MSG = "observable.client_change"
OBSERVABLE_REGISTER_MSG = "observable.register"


class ChangeMessage[T](Message):
    data_id: str
    old_value: T
    new_value: T


class ClientChangeMessage[T](ChangeMessage[T]):
    ...


class RegisterMessage[T](Message):
    data_id: str
    value: T
