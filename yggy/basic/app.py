import shutil
from glob import glob
from itertools import chain
from os import makedirs, path
# import time
from typing import Any, Iterable, cast, overload

from .. import (
    Comm,
    CommWS,
    ObjectModel,
    ObservableManager,
    ObservableObject,
    ObservableObjectFactory,
    ObservableValue,
    ObservableValueFactory,
)
from .http import HTTP
from .watch import Watcher

__all__ = ["App"]


class App:
    __app_root: str
    __web_root: str
    __static_file_exts: list[str]

    __comm: Comm
    __comm_ws: CommWS
    __obs_manager: ObservableManager
    __watcher: Watcher

    def __init__(
        self,
        app_root: str,
        web_root: str,
        static_file_exts: Iterable[str] = ("html", "js", "css", "ico", "png"),
    ) -> None:
        self.__app_root = app_root
        self.__web_root = web_root
        self.__static_file_exts = list(static_file_exts)

        makedirs(self.__web_root, exist_ok=True)

        self.__comm = Comm()
        self.__obs_manager = ObservableManager(self.__comm)
        self.__comm_ws = CommWS(self.__comm, host="0.0.0.0")
        self.__watcher = Watcher(self)
        self.__http = HTTP(self.__web_root)

        obs = self.__obs_manager

        class __ObservableObject[T: ObjectModel](ObservableObject[T]):
            @overload
            def __init__(self, __manager: ObservableManager, __kwds: T = {}) -> None:
                ...

            @overload
            def __init__(self, __kwds: T) -> None:
                ...

            def __init__(self, __arg0: ObservableManager | T = {}, __arg1: T = {}) -> None:
                # overload 0
                if isinstance(__arg0, ObservableManager):
                    super().__init__(__arg0, __arg1)
                    return

                # overload 1
                super().__init__(obs, __arg0)
                
        self.Object = __ObservableObject
            
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
    def obs[T: ObservableObject[Any]](self, __value: type[T]) -> T:
        ...

    @overload
    def obs[T: bool | int | float | str](self, __value: T) -> ObservableValue[T]:
        ...

    def obs(self, _arg0: Any, _arg1: Any = None) -> ObservableValue[Any] | ObservableObject[Any]:
        
        # overload 0
        if isinstance(_arg0, type) and issubclass(_arg0, ObservableObject):
            if _arg1 is None:
                _arg1 = {}
            return cast(ObservableObject[Any], ObservableObjectFactory(self.__obs_manager, _arg0, _arg1))
            ...

        # overload 1
        return cast(ObservableValue[Any], ObservableValueFactory(self.__obs_manager, _arg0))

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
            # while True:
            #     time.sleep(1)
            self.__watcher.start()

        except KeyboardInterrupt:
            self.__http.stop()
            self.__comm.stop()
            self.__comm_ws.stop()
            self.__watcher.stop()
