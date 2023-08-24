from typing import TypedDict


class ObservableSchema[T](TypedDict):
    data_id: str
    value: T
