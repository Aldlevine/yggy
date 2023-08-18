import shutil
from glob import glob
from itertools import chain
from os import makedirs, path
from typing import Any, ClassVar, Iterable, Self, cast, overload

from .. import (
    Comm,
    CommWS,
    ObservableManager,
    ObservableObject,
    ObservableObjectFactory,
    ObservableValue,
    ObservableValueFactory,
)
from .http import HTTP
from .watch import Watcher

__all__ = ["Manager", "obs", "Object"]


@overload
def obs[T: ObservableObject](__value: type[T], **kwds: Any) -> T:
    ...

@overload
def obs[T: bool | int | float | str](__value: T) -> ObservableValue[T]:
    ...


def obs(_arg0: Any, **_kwds: Any) -> ObservableValue[Any] | ObservableObject:
    return Manager.main.obs(_arg0, **_kwds)


class Object(ObservableObject):
    @overload
    def __init__(self, __manager: ObservableManager, /, **__kwds: Any) -> None:
        ...

    @overload
    def __init__(self, /, **__kwds: Any) -> None:
        ...

    def __init__(
        self, __arg0: ObservableManager | None = None, /, **__kwds: Any
    ) -> None:
        # overload 0
        if isinstance(__arg0, ObservableManager):
            super().__init__(__arg0, **__kwds)
            return

        # overload 1
        super().__init__(Manager.main.obs_manager, **__kwds)


class Manager:
    __main: ClassVar[Self | None] = None

    __app_root: str
    __web_root: str
    __static_file_exts: list[str]

    __comm: Comm
    __comm_ws: CommWS
    __obs_manager: ObservableManager
    __watcher: Watcher

    cache_version: int = 0

    def __init__(
        self,
        app_root: str,
        web_root: str,
        static_file_exts: Iterable[str] = ("html", "js", "css", "ico", "png"),
        singleton: bool = False,
    ) -> None:
        self.__app_root = app_root
        self.__web_root = web_root
        self.__static_file_exts = list(static_file_exts)

        makedirs(self.__web_root, exist_ok=True)

        self.__comm = Comm()
        self.__obs_manager = ObservableManager(self.__comm)
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
    def obs_manager(self) -> ObservableManager:
        return self.__obs_manager

    @property
    def app_root(self) -> str:
        return self.__app_root

    @property
    def web_root(self) -> str:
        return self.__web_root

    @property
    def static_file_exts(self) -> list[str]:
        return self.__static_file_exts

    @overload
    def obs[T: ObservableObject](self, __value: type[T], **kwds: Any) -> T:
        ...

    @overload
    def obs[T: bool | int | float | str](self, __value: T) -> ObservableValue[T]:
        ...

    def obs(self, _arg0: Any, **_kwds: Any) -> ObservableValue[Any] | ObservableObject:
        # overload 0
        if isinstance(_arg0, type) and issubclass(_arg0, ObservableObject):
            return cast(
                ObservableObject,
                ObservableObjectFactory(self.__obs_manager, _arg0, **_kwds),
            )

        # overload 1
        return cast(
            ObservableValue[Any], ObservableValueFactory(self.__obs_manager, _arg0)
        )

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
