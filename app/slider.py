from typing import Any

from . import yg


class SliderModel(yg.Model):
    min: yg.Observable[float] = yg.obs(0.0)
    max: yg.Observable[float] = yg.obs(100.0)
    step: yg.Observable[float] = yg.obs(1.0)
    value: yg.Observable[float] = yg.obs(50.0)

    @yg.coerce(min)
    def _(self, __min: Any) -> float:
        return float(__min)

    @yg.validate(min)
    def _(self, __min: float) -> float:
        return min(__min, self.value.get())

    @yg.validate(max)
    def _(self, __max: float) -> float:
        return max(__max, self.value.get())

    @yg.validate(step)
    def _(self, __step: float) -> float:
        if __step <= 0:
            return self.step.get()
        return __step

    @yg.watch(step)
    def _step_change(self) -> None:
        value = self.value.get()
        step = self.step.get()
        self.value.set(round(value / step) * step)
