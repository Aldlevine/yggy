from http.server import HTTPServer, SimpleHTTPRequestHandler
from os import path
from threading import Thread
from typing import Any

from ..logging import get_logger

_logger = get_logger(__loader__.name)


def get_handler_class(__web_root: str) -> type[SimpleHTTPRequestHandler]:
    web_root = __web_root

    class HTTPRequestHandler(SimpleHTTPRequestHandler):
        def do_GET(self) -> None:
            if self.path == "/":
                self.path = "index.html"
            self.path = "./" + path.relpath(web_root + "/" + self.path, path.curdir)
            return super().do_GET()

        def log_message(self, format: str, *args: Any) -> None:
            _logger.info(format % args)

    return HTTPRequestHandler


# def run(__web_root: str) -> None:
#     server = HTTPServer(("0.0.0.0", 8000), get_handler_class(__web_root))
#     server.serve_forever()


# def start(__web_root: str) -> None:
#     _thread = Thread(target=run)


class HTTP:
    __web_root: str
    __server: HTTPServer

    def __init__(self, __web_root: str) -> None:
        self.__web_root = __web_root
        self.__server = HTTPServer(
            ("0.0.0.0", 8000), get_handler_class(self.__web_root)
        )

    def run(self) -> None:
        self.__server.serve_forever()

    def start(self) -> None:
        self.__thread = Thread(target=self.run, daemon=True)
        self.__thread.start()

    def stop(self) -> None:
        self.__server.shutdown()
