from ..comm import Message

OBSERVABLE_CHANGE_MSG = "observable.change"
OBSERVABLE_CLIENT_CHANGE_MSG = "observable.client_change"
OBSERVABLE_LIST_CHANGE_MSG = "observable_list.change"
OBSERVABLE_LIST_CLIENT_CHANGE_MSG = "observable_list.client_change"
OBSERVABLE_REGISTER_MSG = "observable.register"


class BaseChangeMessage(Message):
    data_id: str


class ChangeMessage[T](BaseChangeMessage):
    new_value: T


class ClientChangeMessage[T](ChangeMessage[T]):
    ...


class ListChangeMessage[T](BaseChangeMessage):
    inserts: dict[int, T]
    removes: list[int]


class ListClientChangeMessage[T](ListChangeMessage[T]):
    ...


class RegisterMessage[T](Message):
    data_id: str
    value: T
