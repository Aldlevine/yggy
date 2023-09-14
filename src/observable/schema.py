from typing import TypedDict


class BaseObservableSchema(TypedDict):
    data_id: str


class ObservableSchema[T](BaseObservableSchema):
    value: T


class ObservableListSchema[T](BaseObservableSchema):
    list: list[T]
