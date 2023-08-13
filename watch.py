# pyright: reportUnknownMemberType=false

import subprocess
import time
from datetime import datetime
from threading import Thread

from watchdog.events import FileModifiedEvent, PatternMatchingEventHandler
from watchdog.observers import Observer

from app.app import copy_static_files

observer = Observer()


class EventHandler(PatternMatchingEventHandler):
    __updating: bool = False

    def compile_ts(self) -> None:
        if self.__updating:
            return
        self.__updating = True
        print(f"[{datetime.now()}] build ts")
        subprocess.run("npx tsc".split(" "))
        self.__updating = False

    def copy_file(self, path: str) -> None:
        print(f"[{datetime.now()}] copy {path}")
        copy_static_files(path)

    def on_modified(self, event: FileModifiedEvent):
        path: str = event.src_path
        if path.endswith(".ts"):
            Thread(target=self.compile_ts).start()
        if path.endswith(".html"):
            Thread(
                target=self.copy_file, kwargs={"path": path.removeprefix("./app/")}
            ).start()


event_handler_ts = EventHandler(["*.ts"])
event_handler_html = EventHandler(["*.html"])
observer.schedule(event_handler_ts, path=".", recursive=True)
observer.schedule(event_handler_html, path="./app", recursive=True)
observer.start()

try:
    while True:
        time.sleep(1)
finally:
    observer.stop()
    observer.join()
