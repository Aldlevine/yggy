import uuid
from functools import partial
from inspect import isclass, signature
from textwrap import indent
from typing import (
    Any,
    Callable,
    ClassVar,
    Iterator,
    cast,
    dataclass_transform,
    overload,
)

from ..comm import ReceiverFn_t
from ..logging import get_logger
from ..observable import Observable, Primitive
from ..utils import noop
from .schema import ModelSchema

__all__ = ["Model", "coerce", "obs", "validate", "watch"]

logger = get_logger(f"{__package__}.{__name__}")


class Field:
    ...


class ObservableField[T](Field):
    default: T
    coerce_fn: Callable[["Model", Any], T] | Callable[[Any], T]
    validate_fn: Callable[["Model", T], T] | Callable[[T], T]

    def __init__(self, default: T) -> None:
        super().__init__()
        self.default = default
        self.coerce_fn = type(default)
        self.validate_fn = noop


class WatchField[T](Field):
    fn: Callable[..., T]
    observables: list["ObservableField[Any] | WatchField[Any]"]

    def __init__(
        self,
        fn: Callable[..., T],
        observables: list["ObservableField[Any] | WatchField[Any]"],
    ) -> None:
        super().__init__()
        self.fn = fn
        self.observables = observables


class SubmodelProperty:
    root: "SubmodelField[Any] | SubmodelProperty"
    name: str

    def __init__(
        self, __root: "SubmodelField[Any] | SubmodelProperty", __name: str
    ) -> None:
        self.root = __root
        self.name = __name

    def __getattr__(self, __name: str) -> Any:
        return SubmodelProperty(self, __name)


class SubmodelField[T: "Model"](Field):
    factory: type[T]
    kwds: dict[str, Any]

    def __init__(self, factory: type[T], **kwds: Any) -> None:
        super().__init__()
        self.factory = factory
        self.kwds = kwds

    def __getattr__(self, __name: str) -> Any:
        return SubmodelProperty(self, __name)


def watch[T: Callable[["Model"], Any]](*__observables: Observable[Any]) -> Callable[[Callable[[Any], Any]], Any]:
    def __inner_fn(fn: Callable[["Model"], Any]) -> Observable[Any]:
        fields = cast(list[ObservableField[Any] | WatchField[Any]], __observables)
        return cast(Observable[Any], WatchField(fn, fields))

    return __inner_fn


def coerce[T: Primitive[Any]](__obs: Observable[T]) -> Callable[[Callable[[Any, Any], T]], None]:
    def __inner_fn(__fn: Callable[["Model", Any], T]) -> None:
        assert isinstance(__obs, ObservableField)
        __obs.coerce_fn = __fn

    return __inner_fn


def validate[T: Primitive[Any]](__obs: Observable[T]) -> Callable[[Callable[[Any, T], T]], None]:
    def __inner_fn(__fn: Callable[["Model", T], T]) -> None:
        assert isinstance(__obs, ObservableField)
        __obs.validate_fn = __fn

    return __inner_fn


@overload
def obs[T: "Model"](__factory: type[T], **__kwds: Any) -> T:
    ...


@overload
def obs[T: Primitive[Any]](__value: T) -> Observable[T]:
    ...


def obs(__arg0: Any | type, **__kwds: Any) -> Any:
    if isclass(__arg0) and issubclass(__arg0, Model):
        return SubmodelField[Any](__arg0, **__kwds)
    return ObservableField(__arg0)


@dataclass_transform(eq_default=False, kw_only_default=True)
class Model:
    __model_fields__: ClassVar[dict[str, Field]]

    __id: str
    __observables: dict[str, Observable[Any]]
    __watchers: dict[str, ReceiverFn_t]

    def __init_subclass__(cls) -> None:
        fields: dict[str, Any] = {}
        fields.update({k: v for k, v in cls.__dict__.items() if isinstance(v, Field)})
        for base in cls.__bases__:
            if hasattr(base, "__model_fields__"):
                fields.update(getattr(base, "__model_fields__"))
        cls.__model_fields__ = fields

        for k, v in cls.__model_fields__.items():
            if isinstance(v, (ObservableField, WatchField)):
                cls.__add_observable_prop(k)

    def __init__(self, **__kwargs: Any) -> None:
        self.__id = uuid.uuid4().hex
        self.__observables = {}
        self.__watchers = {}
        for k, f in self.__model_fields__.items():
            if k in __kwargs and isinstance(__kwargs[k], (Observable, Model)):
                if isinstance(__kwargs[k], Observable):
                    self.__observables[k] = __kwargs[k]
                    continue
                if isinstance(__kwargs[k], Model):
                    setattr(self, k, __kwargs[k])
                    continue

            if isinstance(f, ObservableField):
                f = cast(ObservableField[Any], f)

                coerce_fn: Callable[[Any], Any]
                try:
                    if len(signature(f.coerce_fn).parameters) > 1:
                        coerce_fn = partial(f.coerce_fn, self)
                    else:
                        coerce_fn = cast(Callable[[Any], Any], f.coerce_fn)
                except ValueError:
                    coerce_fn = cast(Callable[[Any], Any], f.coerce_fn)

                validate_fn: Callable[[Any], Any]
                try:
                    if len(signature(f.validate_fn).parameters) > 1:
                        validate_fn = partial(f.validate_fn, self)
                    else:
                        validate_fn = cast(Callable[[Any], Any], f.validate_fn)
                except ValueError:
                    validate_fn = cast(Callable[[Any], Any], f.validate_fn)

                default = __kwargs.get(k, f.default)
                self.__observables[k] = Observable(
                    default, coerce=coerce_fn, validate=validate_fn
                )
                continue

            if isinstance(f, WatchField):
                f = cast(WatchField[Any], f)
                self.__add_watch(k, f)
                continue

            # TODO: this needs to be initializable with kwargs
            if isinstance(f, SubmodelField):
                f = cast(SubmodelField[Any], f)
                setattr(self, k, f.factory(**f.kwds))
                continue

        self.__post_init__()

    def __post_init__(self) -> None:
        ...

    def __str__(self) -> str:
        out: list[str] = []
        for key, field in self.__model_fields__.items():
            if isinstance(field, SubmodelField):
                sub_model = getattr(self, key)
                if not isinstance(sub_model, Model):
                    continue
                value = "\n".join(str(sub_model).splitlines()[1:])
                typ = cast(SubmodelField[Any], field).factory.__name__
                out.append(
                    "{key}: {typ} = {{\n{value}".format(key=key, typ=typ, value=value)
                )
            else:
                value = self.__observables[key].get()
                out.append(
                    "{key}: {typ} = {value}".format(
                        key=key, typ=type(value).__name__, value=value
                    )
                )
        return f"{self.__class__.__name__} {{\n{indent("\n".join(out), " " * 2)}\n}}"

    def __json__(self) -> ModelSchema:
        out: dict[str, Any] = {"model_id": self.__id}
        for key, field in self.__model_fields__.items():
            if isinstance(field, SubmodelField):
                sub_model = getattr(self, key)
                if not isinstance(sub_model, Model):
                    continue
                out[key] = sub_model.__json__()
            else:
                out[key] = self.__observables[key].__json__()
        return out

    @property
    def id(self) -> str:
        return self.__id

    @property
    def field_values(self) -> dict[str, "Observable[Any] | Model"]:
        res: dict[str, Observable[Any] | Model] = {}
        for k, f in self.__model_fields__.items():
            if isinstance(f, (ObservableField, WatchField)):
                res[k] = self.__observables[k]
                continue
            if isinstance(f, SubmodelField):
                res[k] = getattr(self, k)
                continue
        return res

    @property
    def observables(self) -> Iterator[Observable[Any]]:
        for obs in self.__observables.values():
            yield obs
        for key, field in self.__model_fields__.items():
            if isinstance(field, SubmodelField):
                sub_obs = getattr(self, key)
                if isinstance(sub_obs, Model):
                    yield from sub_obs.observables

    @classmethod
    def __add_observable_prop(cls, __key: str) -> None:
        @property
        def prop(self: Model):
            return self.__observables[__key]

        setattr(cls, __key, prop)

    def __find_observable(
        self,
        field: Observable[Any]
        | ObservableField[Any]
        | WatchField[Any]
        | SubmodelProperty,
    ) -> Observable[Any]:
        if isinstance(field, SubmodelProperty):
            root = field
            keys: list[str] = []
            while not isinstance(root, SubmodelField):
                keys.append(root.name)
                root = root.root
            root_key = list(self.__model_fields__.keys())[
                list(self.__model_fields__.values()).index(root)
            ]
            observable = getattr(self, root_key)
            for key in keys:
                observable = getattr(observable, key)
            return observable

        if isinstance(field, (ObservableField, WatchField)):
            root_key = list(self.__model_fields__.keys())[
                list(self.__model_fields__.values()).index(field)
            ]
            return self.__observables[root_key]

        assert isinstance(field, Observable)
        return field

    def __add_watch(self, k: str, f: WatchField[Any]) -> None:
        self.__observables[k] = observable = Observable(f.fn(self), coerce=noop)

        def __fn(*__args: Any, **__kwargs: Any) -> None:
            observable.set(f.fn(self))

        self.__watchers[k] = __fn
        for o in [self.__find_observable(field) for field in f.observables]:
            o.watch(__fn)
