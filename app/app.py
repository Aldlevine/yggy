import shutil
from glob import glob
from http.server import HTTPServer, SimpleHTTPRequestHandler
from itertools import chain
from os import makedirs, path
from threading import Thread
from typing import cast

import yggy

__all__ = [
    "comm",
    "obs",
    "run",
]

_static_file_exts = "html", "ico"
_app_root = path.dirname(__file__)
_web_root = path.normpath(path.join(_app_root, "../web"))

makedirs(_web_root, exist_ok=True)


def copy_static_files(__file: str | None = None) -> None:
    global _static_file_exts
    global _app_root
    global _web_root


    if __file == None:
        __files = chain(
            *[
                glob(f"**/*.{ext}", root_dir=_app_root, recursive=True)
                for ext in _static_file_exts
            ]
        )
    else:
        __files = [__file]
    for file in __files:
        shutil.copy(path.join(_app_root, file), path.join(_web_root, file))


comm = yggy.Comm()
obs = yggy.ObservableManager(comm)


def Value[T](__value: T) -> yggy.ObservableValue[T]:
    return cast(yggy.ObservableValue[T], yggy.ObservableValueFactory[T](obs, __value))


class Object[T: yggy.ObjectModel](yggy.ObservableObject[T]):
    def __init__(self, __kwds: T) -> None:
        super().__init__(obs, __kwds)


__comm_ws = yggy.CommWS(comm, host="0.0.0.0")


class HTTPRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self) -> None:
        if self.path == "/":
            self.path = "index.html"
        self.path = "./" + path.relpath(_web_root + "/" + self.path, path.curdir)
        return super().do_GET()


def run_http() -> None:
    server = HTTPServer(("0.0.0.0", 8000), HTTPRequestHandler)
    server.serve_forever()


def run() -> None:
    copy_static_files()
    Thread(target=__comm_ws.run).start()
    Thread(target=run_http).start()
    # __comm_ws.run()
