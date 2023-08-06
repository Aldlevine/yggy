from json import dumps, loads
from typing import Any

__all__ = []


class json:
    @classmethod
    def loads(cls, *args: Any, **kwds: Any) -> Any:
        return loads(*args, **kwds)

    @staticmethod
    def default(obj: Any) -> Any:
        from .observable import Observable, ObservableObject

        if isinstance(obj, ObservableObject):
            result = {k: json.default(v) for k, v in obj.observables.items()}
            result["__observable_object"] = True
            return result
        if isinstance(obj, Observable):
            return {"__observable": True, "id": obj.id}
        return obj

    @classmethod
    def dumps(cls, *args: Any, **kwds: Any) -> Any:
        return dumps(*args, **kwds, default=json.default)
