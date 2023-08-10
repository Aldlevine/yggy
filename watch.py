# pyright: reportUnknownMemberType=false

import subprocess
import time
from datetime import datetime
from threading import Thread

from watchdog.events import FileModifiedEvent, PatternMatchingEventHandler
from watchdog.observers import Observer


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

    def on_modified(self, event: FileModifiedEvent):
        path: str = event.src_path
        if path.endswith(".ts"):
            Thread(target=self.compile_ts).start()


event_handler = EventHandler(["*.ts"])
observer.schedule(event_handler, path=".", recursive=True)
observer.start()

try:
    while True:
        time.sleep(1)
finally:
    observer.stop()
    observer.join()
