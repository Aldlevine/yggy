from subprocess import call

from . import yggy
from .slider import SliderModel


class GlobalModel(yggy.Object):
    volume_slider: SliderModel = yggy.obs(SliderModel)
    other_slider: SliderModel = yggy.obs(SliderModel, value=10, step=10)

    fname: yggy.ObservableValue[str] = yggy.obs("")
    fname_width: yggy.ObservableValue[int] = yggy.obs(10)

    lname: yggy.ObservableValue[str] = yggy.obs("")
    lname_width: yggy.ObservableValue[int] = yggy.obs(10)

    def __post_init__(self) -> None:
        @self.volume_slider.watch("value")
        def _(change: yggy.ChangeMessage[int]) -> None:
            call(
                [
                    *"amixer -q -D pulse sset Master".split(" "),
                    f"{self.volume_slider.value()}%",
                ]
            )


class AppModel(GlobalModel):
    def __init__(self, gm: GlobalModel) -> None:
        self.__dict__.update({**self.__dict__, **gm.__dict__})
        super().__init__()

    def __post_init__(self) -> None:
        @self.watch("fname")
        def _(change: yggy.ChangeMessage[str]) -> None:
            self.fname_width(max(len(self.fname()) + 1, 10))

        @self.watch("lname")
        def _(change: yggy.ChangeMessage[str]) -> None:
            self.lname_width(max(len(self.lname()) + 1, 10))
