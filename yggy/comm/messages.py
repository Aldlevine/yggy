from typing import TypedDict

COMM_ADD_CLIENT_MSG = "comm.add_client"
COMM_REMOVE_CLIENT_MSG = "comm.remove_client"


class Message(TypedDict, total=False):
    message_id: str


class ModifyClientMessage(Message):
    client_id: str
