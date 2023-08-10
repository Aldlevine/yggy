from typing import Any, TypeVar, cast, get_args, get_origin, is_typeddict

__all__ = ["type_py2ts"]


def type_py2ts(t: type) -> str:
    cls = get_origin(t) or t
    args = get_args(t) or []

    if isinstance(cls, TypeVar):
        return "any"
    if cls in [Any]:
        return "any"
    if cls in [int, float]:
        return "number"
    if cls in [str]:
        return "string"
    if cls in [bool]:
        return "boolean"
    if cls in [list]:
        arg = args[0] if len(args) > 0 else Any
        return f"{type_py2ts(arg)}[]"
    if is_typeddict(cls):
        types = [f"{k}: {type_py2ts(v)}" for k, v in cls.__annotations__.items()]
        return f"{{ {', '.join(types)} }}"
    if cls in [dict]:
        if len(args) == 1:
            assert isinstance(args, dict)
            args = cast(dict[str, type], args[0])
            types = [f"{k}: {type_py2ts(v)}" for k, v in args.items()]
            return f"{{ {', '.join(types)} }}"
        else:
            if len(args) == 2:
                key = type_py2ts(args[0])
                val = type_py2ts(args[1])
            else:
                key = type_py2ts(Any)
                val = type_py2ts(Any)
            return f"{{[key: {key}]: {val}}}"
    return "never"
