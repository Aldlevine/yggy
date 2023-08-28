import uuid
from textwrap import indent
from typing import Any, ClassVar, Iterator, cast

from ..logging import get_logger
from ..observable import Observable, ObservableSchema, get
from ..observable.observable import Primitive
from .fields import (
    Field,
    ObservableField,
    ObservableWatchField,
    SubmodelField,
    SubmodelProperty,
)
from .schema import ModelSchema

__all__ = ["Model"]

logger = get_logger(f"{__name__}")


class Model:
    """A base class for managing an observable data model.

    This class is should primarily be constructed with `.field.Field` attributes.
    Similar to a dataclass, these will exist as field definition types at class
    construction time, but at instance initialization, these fields are realized
    into the observable defined by the field.

    There are also a number of decorators that can modify the behavior
    of fields, such as `yg.coerce` and `yg.validate`.

    In order for `Observables` to be reactive, they must first be registered
    with a `yg.ObservableNetwork` (itself with an active `yg.Comm`). Use
    `Model.observables` to obtain an iterator of `Observable`s to pass to
    the `yg.ObservableNetwork`.

    Example:
    ```python
    import yggy as yg;

    class PersonModel(Model):
        fname = yg.obs("")
        lname = yb.obs("")
        age = yg.obs(0)

        @yg.watch(fname, lname)
        def full_name(self) -> str:
            return f"{self.fname.get()} {self.lname.get()}"

        @yg.validate(age)
        def _(self, __age: int) -> int:
            return min(max(__age, 0), 150)

    comm = yg.Comm()
    network = yg.ObservableNetwork(comm)

    person = PersonModel(fname="Raffi", lname="Cavoukian")

    network.register(person.observables)

    comm.start()

    person.fname.set("Chris")
    person.lname.set("Ballew")
    person.full_name.get() # >> "Chris Ballew"
    ```
    """

    __model_fields__: ClassVar[dict[str, Field[Any]]]

    __id: str
    __observables: dict[str, Observable[Any]]
    __submodels: dict[str, "Model"]

    @classmethod
    def __init_subclass__(cls) -> None:
        fields: dict[str, Any] = {}
        fields.update({k: v for k, v in cls.__dict__.items() if isinstance(v, Field)})

        for base in cls.__bases__:
            if hasattr(base, "__model_fields__"):
                fields.update(getattr(base, "__model_fields__"))

        cls.__model_fields__ = fields

        for k, v in cls.__model_fields__.items():
            cls.__add_prop(k, v)

    @classmethod
    def __add_prop(cls, __key: str, __field: Field[Any]) -> None:
        @property
        def observable_prop(self: Model):
            return self.__observables[__key]

        @property
        def submodel_prop(self: Model):
            return self.__submodels[__key]

        if isinstance(__field, ObservableField):
            setattr(cls, __key, observable_prop)
            return

        if isinstance(__field, SubmodelField):
            setattr(cls, __key, submodel_prop)
            return

    def __init__(self, **__kwargs: Any) -> None:
        self.__id = uuid.uuid4().hex
        self.__observables = {}
        self.__submodels = {}

        for k, f in self.__model_fields__.items():
            if k in __kwargs and isinstance(__kwargs[k], (Observable, Model)):
                if isinstance(__kwargs[k], Observable):
                    self.__observables[k] = __kwargs[k]
                    continue

                if isinstance(__kwargs[k], Model):
                    self.__submodels[k] = __kwargs[k]
                    continue

            if isinstance(f, ObservableField):
                f = cast(ObservableField[Any], f)
                self.__observables[k] = f.realize(self, k, **__kwargs)
                continue

            if isinstance(f, SubmodelField):
                self.__submodels[k] = f.realize(self, k, **__kwargs)
                continue

        self.__post_init__()

    def __post_init__(self) -> None:
        """Like a standard `@dataclass`, override `__post_init__`
        to include custom initialization logic after the default
        intialization is complete.
        """
        ...

    def __str__(self) -> str:
        """Returns a neatly nested hierarchy of fields"""

        out: list[str] = []
        for key, field in self.__model_fields__.items():
            if isinstance(field, SubmodelField):
                sub_model = getattr(self, key)
                if not isinstance(sub_model, Model):
                    continue
                value = "\n".join(str(sub_model).splitlines()[1:])
                typ = field.factory.__name__
                out.append(
                    "{key}: {typ} = {{\n{value}".format(key=key, typ=typ, value=value)
                )
            else:
                value = get(self.__observables[key])
                out.append(
                    "{key}: {typ} = {value}".format(
                        key=key, typ=type(value).__name__, value=value
                    )
                )
        return f"{self.__class__.__name__} {{\n{indent('\n'.join(out), ' ' * 2)}\n}}"

    __str__.__doc__ = object.__str__.__doc__

    def __json__(self) -> ModelSchema:
        """Returns a json serializable `ModelSchema`"""

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
        """The unique id for this `Model` instance"""

        return self.__id

    @property
    def field_values(self) -> dict[str, "Observable[Any] | Model"]:
        """A `dict` mapping field names to their respective `Observable` or `Model`"""

        res: dict[str, Observable[Any] | Model] = {}
        for k, f in self.__model_fields__.items():
            if isinstance(f, ObservableField):
                res[k] = self.__observables[k]
                continue
            if isinstance(f, SubmodelField):
                res[k] = self.__submodels[k]
                continue
        return res

    @property
    def observables(self) -> Iterator[Observable[Any]]:
        """An iterator for all `Observable`s in the Model's hierarchy.
        This includes both direct and indirect descendants.

        ```python
        import yggy as yg

        comm = yg.Comm()
        network = yg.ObservableNetwork(comm)
        person = PersonModel()

        network.register(person.observables)
        comm.start()
        ```
        """

        for obs in self.__observables.values():
            yield obs
        for key, field in self.__model_fields__.items():
            if isinstance(field, SubmodelField):
                sub_obs = getattr(self, key)
                if isinstance(sub_obs, Model):
                    yield from sub_obs.observables

    def load_schema(self, __schema: ModelSchema) -> None:
        """Loads values for all descendant `Observable`s.

        This exlcudes fields defined by `ObservableWatchField`
        as these will be recomputed anyway (and may have altered
        callbacks since their last run).
        """

        for k, v in __schema.items():
            if k in self.__observables:
                if isinstance(self.__model_fields__[k], ObservableWatchField):
                    continue
                self.__observables[k].set(cast(ObservableSchema[Any], v)["value"])
                continue
            if k in self.__submodels:
                self.__submodels[k].load_schema(cast(ModelSchema, v))

    def find_observable[
        T: Primitive
    ](
        self, field: Observable[T] | ObservableField[T] | SubmodelProperty[T]
    ) -> Observable[T]:
        """Finds an `Observable` based on a provided field.

        The field may be:
        - An `ObservableField` used to initialize an `Observable` on `self`
        - A `SubmodelProperty` which resolves to a `SubmodelField` on `self`
        - An existing `Observable` (which will be returned unaltered)

        Args:
            field: The field to lookup an `Observable` for

        Returns:
            The matched `Observable`
        """

        if isinstance(field, SubmodelProperty):
            return self.__find_submodel_property(field)

        if isinstance(field, ObservableField):
            return self.__find_observable_field(field)

        assert isinstance(field, Observable)
        return field

    def __find_observable_field[
        T: Primitive
    ](self, __field: ObservableField[T],) -> Observable[T]:
        root_key = list(self.__model_fields__.keys())[
            list(self.__model_fields__.values()).index(__field)
        ]
        return self.__observables[root_key]

    def __find_submodel_property[
        T: Primitive
    ](self, __field: SubmodelProperty[T],) -> Observable[T]:
        root = __field
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
