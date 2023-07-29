import inspect
from textwrap import dedent
from typing import Any, Callable, TypeVar, get_args, get_origin

from flask import make_response, Response
from flask_socketio import SocketIO

Rpc_T = TypeVar("Rpc_T", bound=Callable)


class Rpc:
    socketio: SocketIO
    functions: dict[str, Callable] = {}

    def __init__(self, socketio: SocketIO) -> None:
        self.socketio = socketio

    def __call__(self, fn: Rpc_T) -> Any:
        self.socketio.on(fn.__name__)(fn)
        self.functions[fn.__name__] = fn

    def type_py2ts(self, t: type) -> str:
        cls = get_origin(t) or t
        args = get_args(t) or []

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
            return f"{self.type_py2ts(arg)}[]"
        ...

    def ts_module(self) -> str:
        js_lines = []
        for name, fn in self.functions.items():
            sig = inspect.signature(fn)
            args = sig.parameters.keys()
            args_str = ", ".join(args)

            args_types = [
                f"{k}: {self.type_py2ts(v.annotation)}"
                for k, v in sig.parameters.items()
            ]
            args_types_str = ", ".join(args_types)
            js_fn = dedent(f"""\
            export function {name}({args_types_str}) {{
                sock.emit("{name}", {args_str});
            }}
            """)
            js_lines.append(js_fn)

        js = "\n".join(js_lines)

        js = dedent(f"""\
        import {{ io }} from "socket.io-client";
        export const sock = io();
                    
        """) + js

        return js
