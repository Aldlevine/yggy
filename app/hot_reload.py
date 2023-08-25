# pyright: reportUnknownMemberType=false

import subprocess
from watchdog.events import FileModifiedEvent, PatternMatchingEventHandler
from watchdog.observers import Observer
from watchdog.utils.event_debouncer import EventDebouncer

from yggy.logging import get_logger

logger = get_logger(f"{__package__}.{__name__}")

process = subprocess.Popen("python -m app".split(" "))


class EventHandler(PatternMatchingEventHandler):
    def __init__(
        self,
        patterns: list[str] | None = None,
        ignore_patterns: list[str] | None = None,
        ignore_directories: bool = False,
        case_sensitive: bool = False,
    ):
        super().__init__(patterns, ignore_patterns, ignore_directories, case_sensitive)
        self.__debouncer = EventDebouncer(1, self.handle_modified)
        self.__debouncer.start()

    def on_modified(self, event: FileModifiedEvent):
        self.__debouncer.handle_event(event)

    def handle_modified(self, events: list[FileModifiedEvent]):
        global process
        process.terminate()
        process.wait()
        process = subprocess.Popen("python -m app".split(" "))


__observer = Observer()
event_handler = EventHandler(
    patterns=[
        "*.py",
    ],
)

__observer.schedule(event_handler, path=".", recursive=True)
__observer.start()

try:
    while __observer.is_alive():
        __observer.join(1)
finally:
    __observer.stop()
    __observer.join()
    process.terminate()
    process.wait()
