import os
import re
from http import HTTPStatus
from http.server import HTTPServer, SimpleHTTPRequestHandler
from os import path
from pathlib import PurePath
from threading import Thread
from typing import TYPE_CHECKING, Any

from ..logging import get_logger

if TYPE_CHECKING:
    from .manager import Manager

_logger = get_logger(f"{__name__}")

yggy_root = PurePath(__file__).parent.parent


def get_handler_class(manager: "Manager") -> type[SimpleHTTPRequestHandler]:
    web_paths = manager.web_paths
    web_root = manager.web_root

    class HTTPRequestHandler(SimpleHTTPRequestHandler):
        def do_GET(self) -> None:
            if self.path == "/":
                self.path = "index.html"

            found_path = False
            for prefix, mapped_path in web_paths.items():
                if self.path.startswith(prefix):
                    self.path = "./" + path.relpath(
                        mapped_path + "/" + self.path.removeprefix(prefix), path.curdir
                    )
                    found_path = True
                    break

            if not found_path:
                self.path = "./" + path.relpath(
                    web_root + "/" + self.path.removeprefix("/"), path.curdir
                )

            fp = self.translate_path(self.path)
            if not path.exists(fp) or path.isdir(fp):
                self.send_error(HTTPStatus.NOT_FOUND, "File not found")
                return

            ctype = self.guess_type(fp)

            with open(fp, "rb") as f:
                fs = os.fstat(f.fileno())
                if f.name.split("?")[0].endswith(".js"):
                    code = f.read().decode()
                    # this monstrosity is a naive way to replace ES import/export declarations
                    # with a cache-busting version, for hot module reload. Works for now.
                    # TODO: Improve cache-busting method
                    code = re.sub(
                        r"((?:import|(?:export[^\"'\n]+from))[^\"'\n]*)([\"'])([^\"'\n]*)([\"'])",
                        rf"\1\2\3?uuid={manager.cache_version}\4",
                        code,
                    )
                    enc = code.encode()
                    self.send_response(HTTPStatus.OK)
                    self.send_header("Content-type", ctype)
                    self.send_header("Content-Length", str(len(enc)))
                    self.end_headers()
                    self.wfile.write(enc)
                else:
                    self.send_response(HTTPStatus.OK)
                    self.send_header("Content-type", ctype)
                    self.send_header("Content-Length", str(fs[6]))
                    self.end_headers()
                    self.copyfile(f, self.wfile)

        def log_message(self, format: str, *args: Any) -> None:
            _logger.info(format % args)

    return HTTPRequestHandler


class HTTP:
    __manager: "Manager"
    __server: HTTPServer
    __host: str
    __port: int

    def __init__(
        self, __manager: "Manager", host: str = "0.0.0.0", port: int = 8000
    ) -> None:
        self.__manager = __manager
        self.__host = host
        self.__port = port
        self.__server = HTTPServer(
            (self.__host, self.__port), get_handler_class(self.__manager)
        )

    def run(self) -> None:
        self.__server.serve_forever()

    def start(self) -> None:
        self.__thread = Thread(target=self.run, daemon=True)
        self.__thread.start()

    def stop(self) -> None:
        self.__server.shutdown()
