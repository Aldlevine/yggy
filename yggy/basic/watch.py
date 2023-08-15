# pyright: reportUnknownMemberType=false

from logging import INFO
import subprocess
from os import path
from threading import Thread
from typing import TYPE_CHECKING

from watchdog.events import FileModifiedEvent, PatternMatchingEventHandler
from watchdog.observers import Observer

from ..logging import get_logger

if TYPE_CHECKING:
    from .app import App

logger = get_logger(__loader__.name)
watchdog_logger = get_logger("watchdog")
watchdog_logger.level = INFO


class EventHandler(PatternMatchingEventHandler):
    __updating: bool = False
    __app: "App"

    def __init__(
        self,
        patterns: list[str] | None = None,
        ignore_patterns: list[str] | None = None,
        ignore_directories: bool = False,
        case_sensitive: bool = False,
        *,
        app: "App",
    ):
        super().__init__(patterns, ignore_patterns, ignore_directories, case_sensitive)
        self.__app = app

    def compile_ts(self) -> None:
        if self.__updating:
            return
        self.__updating = True
        logger.info("build ts")
        subprocess.run("npx tsc".split(" "))
        self.__updating = False

    def copy_file(self, path: str) -> None:
        logger.info(f"copy {path}")
        self.__app.copy_static_files(path)

    def on_modified(self, event: FileModifiedEvent):
        path: str = event.src_path
        if path.endswith(".ts"):
            Thread(target=self.compile_ts).start()
        if path.endswith(".html"):
            Thread(
                target=self.copy_file, kwargs={"path": path.removeprefix("./app/")}
            ).start()


class Watcher:
    __app: "App"

    __event_handler: EventHandler

    def __init__(self, __app: "App") -> None:
        self.__app = __app
        self.__observer = Observer()
        self.__observer.daemon = True
        webroot = "./" + path.relpath(self.__app.web_root, path.curdir)
        self.__event_handler = EventHandler(
            patterns=["*.ts", *[f"*.{ext}" for ext in self.__app.static_file_exts]],
            ignore_patterns=[webroot + "/*"],
            app=__app,
        )
        self.__observer.schedule(self.__event_handler, path=".", recursive=True)

    def start(self) -> None:
        self.__observer.start()
        try:
            while self.__observer.is_alive():
                self.__observer.join(1)
        finally:
            self.__observer.stop()
            self.__observer.join()

    def stop(self) -> None:
        self.__observer.stop()
