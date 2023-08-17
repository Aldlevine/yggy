import os
from logging import getLevelNamesMapping, getLogger
from pathlib import PurePath
from subprocess import call

import yggy.basic as yggy

from .qrcode import save_ip_qrcode

LOGLEVEL = os.environ.get("LOGLEVEL", "INFO")
level_id = getLevelNamesMapping()[LOGLEVEL]
getLogger().level = level_id

app_root = PurePath(__file__).parent
web_root = app_root.parent / "web"

app = yggy.app.App(
    app_root=app_root.as_posix(),
    web_root=web_root.as_posix(),
)

save_ip_qrcode(web_root)


class SliderModel(app.Object):
    min: yggy.ObservableValue[int] = app.obs(0)
    max: yggy.ObservableValue[int] = app.obs(100)
    step: yggy.ObservableValue[int] = app.obs(1)
    value: yggy.ObservableValue[int] = app.obs(50)

    def __post_init__(self) -> None:
        @self.step.watch
        def _(change: yggy.ChangeMessage[int]) -> None:
            if self.step() <= 0:
                change["stop_propagation"] = True
                self.step(1)
            self.value(round(self.value() / self.step()) * self.step())

        @self.min.watch
        @self.max.watch
        def _(change: yggy.ChangeMessage[int]) -> None:
            if self.min() > self.value():
                change["stop_propagation"] = True
                self.min(self.value())

            if self.max() < self.value():
                change["stop_propagation"] = True
                self.max(self.value())


class Model(app.Object):
    fname: yggy.ObservableValue[str] = app.obs("")
    lname: yggy.ObservableValue[str] = app.obs("")
    volume_slider = app.obs(SliderModel)
    other_slider = app.obs(SliderModel, value=10, step=10)

    def __post_init__(self) -> None:
        @self.volume_slider.value.watch
        def _(change: yggy.ChangeMessage[int]) -> None:
            call(
                [
                    *"amixer -q -D pulse sset Master".split(" "),
                    f"{model.volume_slider.value()}%",
                ]
            )


model = Model()


@app.comm.recv(yggy.OBSERVABLE_READY_MSG)
def rect_obs_ready(msg: yggy.ReadyMessage) -> None:
    app.comm.send("load_obj", model.id, client_ids=[msg["client_id"]])


if __name__ == "__main__":
    app.run()
