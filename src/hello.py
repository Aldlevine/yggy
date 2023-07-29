from dataclasses import dataclass
import os
import subprocess
from pathlib import Path
from typing import Any, Generic, TypeVar
from flask import Flask, make_response
from flask_socketio import SocketIO

from pyggy.rpc import Rpc

app = Flask(__name__)
socketio = SocketIO(app)
rpc = Rpc(socketio)


@app.route("/")
def index():
    with open("assets/index.html") as file:
        return file.read()


@app.route("/<path:file>.js")
def serve_js(file: str):
    try:
        with open(f"assets/{file}.js") as f:
            text = f.read()
    except FileNotFoundError:
        with open(f"assets/generated/{file}.js") as f:
            text = f.read()

    resp = make_response(text)
    resp.mimetype = "text/javascript"
    return resp


T = TypeVar("T")


class Observable(Generic[T]):
    _id: str
    _value: T

    def __init__(self) -> None:
        pass

    @property
    def value(self) -> T:
        return self._value

    @value.setter
    def value(self, value: T) -> None:
        self._value = value


observables: dict[str, Observable[Any]] = {}


def register_observable(id: str, value: T) -> Observable[T]:
    observable = Observable[T](id, value)
    observables[id] = observable
    return observable


@rpc
def update_model(data: dict[str, Any]) -> None:
    ...


@rpc
def start() -> None:
    socketio.emit("register_observable", "my_observable", 1)


if __name__ == "__main__":
    gen_dir = Path(".") / "web/generated"
    os.makedirs(gen_dir, exist_ok=True)
    js = rpc.ts_module()
    with open(gen_dir / "rpc_import.ts", "w") as f:
        f.write(js)
    subprocess.call(f"npx tsc".split(" "))
    with open(Path("./web/index.html"), "r") as inf:
        with open(Path("./assets/index.html"), "w") as outf:
            outf.write(inf.read())
    socketio.run(app)
