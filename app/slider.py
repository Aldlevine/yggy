from . import yggy


class SliderModel(yggy.Object):
    min: yggy.ObservableValue[int] = yggy.obs(0)
    max: yggy.ObservableValue[int] = yggy.obs(100)
    step: yggy.ObservableValue[int] = yggy.obs(1)
    value: yggy.ObservableValue[int] = yggy.obs(50)

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
