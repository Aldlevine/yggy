from pathlib import Path
from pyggy import component as pc
from pyggy import observable as po

__all__ = ["Slider"]


class Slider(pc.Component):
    _esm = Path("./slider.ts")

    val: int = po.value(0)
    min: int = po.value(0)
    max: int = po.value(100)
    step: int = po.value(1)
