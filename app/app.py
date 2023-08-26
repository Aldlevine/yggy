import datetime
from asyncio import sleep, create_subprocess_exec, create_task, get_running_loop


from . import yg
from .slider import SliderModel


class GlobalModel(yg.Model):
    fname = yg.obs("")
    lname = yg.obs("")

    volume_slider = yg.obs(SliderModel)
    blur_slider = yg.obs(SliderModel, min=0, max=5, value=0, step=0.01)

    red = yg.obs(1.0)
    green = yg.obs(1.0)
    blue = yg.obs(1.0)
    alpha = yg.obs(1.0)

    morph_radius = yg.obs(0)

    @yg.watch(volume_slider.value)
    def _(self) -> None:
        volume = self.volume_slider.value.get()
        try:
            get_running_loop()
            create_task(self.__set_voume_task(volume))
        except RuntimeError:
            ...

    async def __set_voume_task(self, volume: float) -> None:
        proc = await create_subprocess_exec(
            *f"amixer -q -D pulse sset Master {volume}%".split(" ")
        )
        await proc.communicate()

    @yg.watch(fname)
    def fname_width(self) -> int:
        return max(len(self.fname.get()) + 1, 10)

    @yg.watch(lname)
    def lname_width(self) -> int:
        return max(len(self.lname.get()) + 1, 10)

    @yg.watch(fname, lname)
    def full_name(self) -> str:
        return f"{self.fname.get()} {self.lname.get()}".strip()
        # return "".join(reversed(f"{self.fname.get()} {self.lname.get()}".strip()))

    @yg.watch(full_name)
    def greeting(self) -> str:
        return f"Hello, <b>{self.full_name.get()}</b>! How are you doing?"


class SessionModel(yg.Model):
    session_time = yg.obs(0.0)

    def __post_init__(self) -> None:
        from asyncio import create_task

        create_task(self.__loop())

    async def __loop(self) -> None:
        start = datetime.datetime.now()
        while True:
            now = datetime.datetime.now()
            diff = now - start
            self.session_time.set(diff.total_seconds() * 1000)
            await sleep(1)


class AppModel(GlobalModel, SessionModel):
    def __init__(self, gm: GlobalModel) -> None:
        super().__init__(**gm.field_values)
