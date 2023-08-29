import shutil
from glob import glob
from itertools import chain
from os import makedirs, path
from typing import ClassVar, Iterable, Self

from .. import Comm, CommWS, ObservableNetwork
from .http import HTTP
from .watcher import Watcher

__all__ = ["Manager"]


class Manager:
    __main: ClassVar[Self | None] = None

    __app_root: str
    __web_root: str
    __web_paths: dict[str, str]
    __static_file_exts: list[str]

    __comm: Comm
    __comm_ws: CommWS
    __network: ObservableNetwork
    __watcher: Watcher

    cache_version: int = 0

    def __init__(
        self,
        app_root: str,
        web_root: str,
        web_paths: dict[str, str] = {},
        static_file_exts: Iterable[str] = ("html", "js", "css", "ico", "png"),
        singleton: bool = False,
    ) -> None:
        self.__app_root = app_root
        self.__web_root = web_root
        self.__web_paths = web_paths
        self.__static_file_exts = list(static_file_exts)

        makedirs(self.__web_root, exist_ok=True)

        self.__comm = Comm()
        self.__network = ObservableNetwork(self.__comm)
        self.__comm_ws = CommWS(self.__comm, host="0.0.0.0")
        self.__watcher = Watcher(self)
        self.__http = HTTP(self)

        if singleton:
            type(self).__main = self

    @classmethod
    @property
    def main(cls) -> Self:
        assert cls.__main is not None
        return cls.__main

    @property
    def network(self) -> ObservableNetwork:
        return self.__network

    @property
    def app_root(self) -> str:
        return self.__app_root

    @property
    def web_root(self) -> str:
        return self.__web_root

    @property
    def web_paths(self) -> dict[str, str]:
        return self.__web_paths

    @property
    def static_file_exts(self) -> list[str]:
        return self.__static_file_exts

    @property
    def comm(self) -> Comm:
        return self.__comm

    def copy_static_files(self, _file: str | None = None) -> None:
        if _file == None:
            files = chain(
                *[
                    glob(f"**/*.{ext}", root_dir=self.__app_root, recursive=True)
                    for ext in self.__static_file_exts
                ]
            )
        else:
            files = [_file]
        for file in files:
            shutil.copy(
                path.join(self.__app_root, file), path.join(self.__web_root, file)
            )

    def run(self) -> None:
        try:
            self.copy_static_files()

            self.__comm_ws.start()
            self.__comm.start()
            self.__http.start()
            self.__watcher.start()

        except KeyboardInterrupt:
            self.__http.stop()
            self.__comm.stop()
            self.__comm_ws.stop()
            self.__watcher.stop()
