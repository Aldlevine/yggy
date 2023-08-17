# pyright: reportUnknownMemberType=false

import subprocess
from logging import INFO
from os import path
from threading import Thread
from typing import TYPE_CHECKING

from watchdog.events import FileModifiedEvent, PatternMatchingEventHandler
from watchdog.observers import Observer
from watchdog.utils.event_debouncer import EventDebouncer

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
        self.__debouncer = EventDebouncer(1, self.handle_modified)
        self.__debouncer.start()

    def compile_ts(self) -> None:
        if self.__updating:
            return
        self.__updating = True
        logger.info("build ts")
        subprocess.run("npx tsc".split(" "))
        self.__app.comm.send("hot_reload", None)
        self.__updating = False

    def copy_file(self, path: str) -> None:
        logger.info(f"copy {path}")
        self.__app.copy_static_files(path)
        self.__app.comm.send("hot_reload", None)

    def on_modified(self, event: FileModifiedEvent):
        self.__debouncer.handle_event(event)

    def handle_modified(self, events: list[FileModifiedEvent]):
        event = events[0]
        path: str = event.src_path
        if path.endswith(".ts") or path.endswith(".tsx"):
            Thread(target=self.compile_ts).start()
        if any([path.endswith(ext) for ext in self.__app.static_file_exts]):
            Thread(
                target=self.copy_file, kwargs={"path": path.removeprefix("./app/")}
            ).start()


class Watcher:
    __app: "App"

    def __init__(self, __app: "App") -> None:
        self.__app = __app
        self.__observer = Observer()
        self.__observer.daemon = True
        app_root = "./" + path.relpath(self.__app.app_root, path.curdir)
        web_root = "./" + path.relpath(self.__app.web_root, path.curdir)
        event_handler_ts = EventHandler(
            patterns=[
                "*.ts",
                "*.tsx",
            ],
            ignore_patterns=[web_root + "/*"],
            app=__app,
        )

        event_handler_static = EventHandler(
            patterns=[
                *[f"*.{ext}" for ext in self.__app.static_file_exts],
            ],
            app=__app,
        )

        self.__observer.schedule(event_handler_ts, path=".", recursive=True)
        self.__observer.schedule(event_handler_static, path=app_root, recursive=True)

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
