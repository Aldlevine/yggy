# pyright: reportMissingTypeStubs=false,  reportUnknownMemberType=false

import inspect
from textwrap import dedent
from typing import Any, Callable, ClassVar, Self, TypeVar, TypeVarTuple, cast, overload

from flask import Flask
from flask_socketio import SocketIO

from .json import json
from .py2ts import type_py2ts

__all__ = [
    "Comm",
    "HandlerFn_t",
    "get_global_comm",
    "init_global_comm",
]

T = TypeVar("T")
TT = TypeVarTuple("TT")

HandlerFn_t = Callable[[*TT], T]
HandlerInnerFn_t = Callable[[HandlerFn_t[*TT, T]], HandlerFn_t[*TT, T]]


class Comm:
    _sids: ClassVar[list[str]] = []

    _app: Flask
    _socketio: SocketIO
    _handlers: dict[str, Callable[[Any], Any]]

    def __init__(self, app: Flask) -> None:
        self._socketio = SocketIO(app, json=json)
        self._app = app
        self._handlers = {}

    def run(self) -> None:
        self._socketio.run(self._app, host="0.0.0.0")

    @overload
    def recv(self, message: str) -> HandlerInnerFn_t[*TT, T]:
        ...

    @overload
    def recv(self, message: str, handler: HandlerFn_t[*TT, T]) -> None:
        ...

    def recv(self, message: str, handler: HandlerFn_t[*TT, T] | None = None) -> Any:
        assert message not in self._handlers, "only one handler may exist per message"

        def inner_fn(handler: HandlerFn_t[*TT, T]) -> HandlerFn_t[*TT, T]:
            assert self._socketio.server is not None
            self._handlers[message] = handler
            siofn = cast(HandlerInnerFn_t[*TT, T], self._socketio.server.on(message))
            return siofn(handler)

        if handler is None:
            return inner_fn

        inner_fn(handler)

    def send(self, message: str, *data: Any, sid: str | None = None) -> None:
        assert self._socketio.server is not None
        self._socketio.server.emit(message, data, to=sid)

    def generate_ts(self) -> str:
        js_lines: list[str] = []
        for name, fn in self._handlers.items():
            sig = inspect.signature(fn)
            args_types = [
                f"{k}: {type_py2ts(v.annotation)}"
                for k, v in list(sig.parameters.items())[1:]
            ]
            args_types_str = ", ".join(args_types)
            ts_fn = f'send(__message: "{name}", {args_types_str}): void;'
            js_lines.append(ts_fn)

        ts = "\n    ".join(js_lines)

        ts = dedent("""\
        export interface IComm {{
            {ts}
        }}
        """).format(ts=ts)

        return ts

    _comm: ClassVar["Comm | None"] = None

    @classmethod
    def init_global_comm(cls, app: Flask) -> Self:
        cls._comm = Comm(app)

        def connect(sid: str, environ: dict[str, Any], auth: None) -> bool:
            Comm._sids.append(sid)
            print("CONNECT", sid)
            return True

        cls._comm.recv("connect", connect)

        def disconnect(sid: str) -> None:
            Comm._sids.remove(sid)
            print("DISCONNECT", sid)

        cls._comm.recv("disconnect", disconnect)

        return cls._comm

    @classmethod
    def get_global_comm(cls) -> Self:
        assert cls._comm is not None
        return cls._comm


init_global_comm = Comm.init_global_comm
get_global_comm = Comm.get_global_comm
