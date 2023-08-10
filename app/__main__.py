import shutil
from itertools import chain
from os import path, makedirs
from glob import glob
from http.server import HTTPServer, SimpleHTTPRequestHandler
from threading import Thread
from typing import Any

import yggy


_static_file_exts = "html", "ico"
_app_root = path.dirname(__file__)
_web_root = path.normpath(path.join(_app_root, "../web"))

makedirs(_web_root, exist_ok=True)


def copy_static_files() -> None:
    global _static_file_exts
    global _app_root
    global _web_root

    __files = chain(
        *[
            glob(f"**/*.{ext}", root_dir=_app_root, recursive=True)
            for ext in _static_file_exts
        ]
    )
    for file in __files:
        shutil.copy(path.join(_app_root, file), path.join(_web_root, file))


copy_static_files()


comm = yggy.Comm()
comm_ws = yggy.CommWS(comm, host="0.0.0.0")

obs = yggy.ObservableManager(comm)


@comm.recv(yggy.OBSERVABLE_CHANGE_MSG)
async def handle_msg(data: yggy.ObservableChange[Any]) -> None:
    print(data)


o1 = obs.value(10)
o2 = obs.value(20)


class HTTPRequestHandler(SimpleHTTPRequestHandler):
    def do_GET(self) -> None:
        if self.path == "/":
            self.path = "index.html"
        self.path = "./" + path.relpath(_web_root + "/" + self.path, path.curdir)
        return super().do_GET()


def run() -> None:
    server = HTTPServer(("0.0.0.0", 8000), HTTPRequestHandler)
    server.serve_forever()


Thread(target=comm_ws.run).start()
Thread(target=run).start()
