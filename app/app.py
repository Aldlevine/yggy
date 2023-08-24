import datetime
from asyncio import sleep
from subprocess import call

from . import yg
from .slider import SliderModel


class GlobalModel(yg.Model):
    volume_slider = yg.obs(SliderModel)
    blur_slider = yg.obs(SliderModel, min=0, max=2.5, value=0, step=0.01)
    fname = yg.obs("")
    lname = yg.obs("")

    @yg.watch(volume_slider.value)
    def _(self) -> None:
        volume = self.volume_slider.value.get()
        call(f"amixer -q -D pulse sset Master {volume}%".split(" "))

    @yg.watch(fname)
    def fname_width(self) -> int:
        return max(len(self.fname.get()) + 1, 10)

    @yg.watch(lname)
    def lname_width(self) -> int:
        return max(len(self.lname.get()) + 1, 10)

    @yg.watch(fname, lname)
    def full_name(self) -> str:
        return f"{self.fname.get()} {self.lname.get()}".strip()


class SessionModel(yg.Model):
    session_time = yg.obs("")

    def __post_init__(self) -> None:
        from asyncio import create_task

        create_task(self.__loop())

    async def __loop(self) -> None:
        start = datetime.datetime.now()
        while True:
            now = datetime.datetime.now()
            diff = now - start
            h, r = divmod(diff.total_seconds(), 60 * 60)
            m, s = divmod(r, 60)
            self.session_time.set(f"{int(h):02}:{int(m):02}:{int(s):02}")
            await sleep(1)


class AppModel(GlobalModel, SessionModel):
    def __init__(self, gm: GlobalModel) -> None:
        super().__init__(**gm.field_values)
