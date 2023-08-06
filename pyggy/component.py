import abc
from pathlib import Path
from textwrap import dedent
from typing import ClassVar

from .comm import get_global_comm
from .observable.observable_object import ObservableObject
from .py2ts import type_py2ts

__all__ = [
    "Component",
]


class Component(ObservableObject, abc.ABC):
    _component_registry: ClassVar[dict[str, "type[Component]"]] = {}

    _esm: ClassVar[str | Path]
    _css: ClassVar[str | Path]

    @classmethod
    def __init_subclass__(cls) -> None:
        super().__init_subclass__()
        Component._component_registry[cls.__qualname__] = cls

    @classmethod
    def generate_ts(cls) -> str:
        ifaces: list[str] = []
        for comp_id, component in Component._component_registry.items():
            members: list[str] = []
            for key, observable in component.observable_factories.items():
                member = f"{key}: {type_py2ts(observable.type)};"
                members.append(member)
            members_str = "\n    ".join(members)
            iface = dedent("""\
            export interface {comp_id}Model extends ObservableObject {{
                {members_str}
            }}
            """).format(comp_id=comp_id, members_str=members_str)
            ifaces.append(iface)
        return dedent("""\
        import { ObservableObject } from "./observable.js";
        """) + "\n".join(ifaces)

    def attach(self, parent_element: str, sid: str | None = None) -> None:
        comm = get_global_comm()
        comm.send(
            "component.attach",
            parent_element,
            type(self).__qualname__,
            self.id,
            sid=sid,
        )
