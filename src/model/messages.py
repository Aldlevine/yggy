from ..comm import Message

MODEL_REGISTER_MSG = "model.register"


class RegisterMessage(Message):
    model_id: str
    attrs: dict[str, str]
