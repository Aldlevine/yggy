from json import dumps, loads
from typing import Any, Callable

__all__ = ["json"]


class json:
    @classmethod
    def loads(cls, *args: Any, **kwds: Any) -> Any:
        return loads(*args, **kwds)

    @staticmethod
    def default(obj: Any) -> Any:
        if hasattr(obj, "__json__") and isinstance(obj.__json__, Callable):
            obj = obj.__json__()
        return obj

    @classmethod
    def dumps(cls, *args: Any, **kwds: Any) -> str:
        return dumps(*args, **kwds, default=json.default)
