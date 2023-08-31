import abc
from inspect import isclass
from io import StringIO
from typing import (
    Any,
    Generic,
    Protocol,
    TypeVar,
    cast,
    get_args,
    get_origin,
    is_typeddict,
    runtime_checkable,
)

from ..types import Primitive


@runtime_checkable
class HasIfaceCodegen(Protocol):
    @classmethod
    def __iface_codegen__(cls) -> "Iface_t":
        ...


@runtime_checkable
class HasBuiltinCodegen(Protocol):
    @classmethod
    def __builtin_codegen__(cls) -> str:
        ...


type Attr_t = (
    TypeVar | type[Primitive] | type[HasIfaceCodegen] | type[HasBuiltinCodegen]
)
type Iface_t = dict[str, Attr_t]


class CodeGenerator:
    __interfaces: set[type[HasIfaceCodegen]]

    def __init__(self) -> None:
        self.__interfaces = set()

    def clear_interfaces(self) -> None:
        self.__interfaces.clear()

    def add_interface[T: type[HasIfaceCodegen]](self, t: T) -> T:
        self.__interfaces.add(t)
        return t

    def generate_interface(self, iface: type[HasIfaceCodegen]) -> str:
        buffer = StringIO()
        generic_str = self.__get_generic_decl_str(iface)
        extends = [b for b in iface.__bases__ if issubclass(b, HasIfaceCodegen)]
        super_keys = [k for e in extends for k in e.__iface_codegen__().keys()]
        if len(extends) > 0:
            extends_str = " extends " + ", ".join(map(self.__get_type_ref_str, extends))
        else:
            extends_str = ""

        print(
            "export interface"
            f" {self.__get_type_decl_str(iface)}{generic_str}{extends_str} {{",
            file=buffer,
        )
        for key, t in iface.__iface_codegen__().items():
            if key in super_keys:
                continue
            print(f"    {key}: {self.__get_type_ref_str(t)};", file=buffer)
        print("}", file=buffer)
        return buffer.getvalue()

    def generate_interfaces(self) -> list[str]:
        ifaces = sorted(self.__interfaces, key=lambda i: i.__name__)
        return [self.generate_interface(iface) for iface in ifaces]

    def __get_type_decl_str(self, t: type[HasIfaceCodegen | HasBuiltinCodegen]) -> str:
        return t.__name__

    def __get_type_ref_str(self, t: Attr_t) -> str:
        primitive = self.__get_primitive_str(t)
        if primitive is not None:
            return primitive
        origin = get_origin(t) or t
        args = get_args(t) or tuple()
        if isclass(origin) and issubclass(origin, (HasIfaceCodegen, HasBuiltinCodegen)):
            generic_str = self.__get_generic_ref_str(args)
            return f"{self.__get_type_decl_str(origin)}{generic_str}"
        return "unknown"

    def __get_generic_decl_str(self, t: type[HasIfaceCodegen]) -> str:
        if issubclass(t, Generic):
            return f"<{", ".join(map(str, t.__type_params__))}>"
        return ""

    def __get_generic_ref_str(self, args: tuple[type, ...]) -> str:
        if len(args) == 0:
            return ""
        return f"<{", ".join(map(self.__get_type_ref_str, args))}>"

    def __get_primitive_str(self, t: Attr_t) -> str | None:
        if isinstance(t, TypeVar):
            return str(t)
        cls = get_origin(t) or t
        args = get_args(t) or []
        if cls in [Any]:
            return "any"
        if cls in [int, float]:
            return "number"
        if cls in [str]:
            return "string"
        if cls in [bool]:
            return "boolean"
        if cls in [list]:
            arg = args[0] if len(args) > 0 else Any
            return f"{self.__get_type_ref_str(arg)}[]"
        if is_typeddict(cls):
            types = [
                f"{k}: {self.__get_type_ref_str(v)}"
                for k, v in cls.__annotations__.items()
            ]
            return f"{{ {', '.join(types)} }}"
        if cls in [dict]:
            if len(args) == 1:
                assert isinstance(args, dict)
                args = cast(dict[str, type], args[0])
                types = [f"{k}: {self.__get_type_ref_str(v)}" for k, v in args.items()]
                return f"{{ {', '.join(types)} }}"
            else:
                if len(args) == 2:
                    key = self.__get_type_ref_str(args[0])
                    val = self.__get_type_ref_str(args[1])
                else:
                    key = self.__get_type_ref_str(Any)
                    val = self.__get_type_ref_str(Any)
                return f"{{[key: {key}]: {val}}}"
        return None


cgen = CodeGenerator()


class AddInterface(abc.ABC):
    @classmethod
    def __init_subclass__(cls, exclude: bool = False) -> None:
        super().__init_subclass__()
        if not exclude:
            cgen.add_interface(cls)

    @classmethod
    def __iface_codegen__(cls) -> Iface_t:
        ...


class AnnotateInterface(AddInterface, exclude=True):
    @classmethod
    def __iface_codegen__(cls) -> Iface_t:
        return cls.__annotations__
