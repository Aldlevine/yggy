from typing import Any
from ..observable import ObservableSchema


ModelSchema = dict[str, "str | ObservableSchema[Any] | ModelSchema"]
