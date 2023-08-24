from typing import Any
from ..observable import ObservableSchema


type ModelSchema = dict[str, str | ObservableSchema[Any] | ModelSchema]
