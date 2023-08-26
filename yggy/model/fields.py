import abc
from typing import TYPE_CHECKING, Any, Callable

from ..observable import Observable
from ..observable.observable import Observable
from ..utils.functools import bind_fn, noop

if TYPE_CHECKING:
    from .model import Model


class Field[T](abc.ABC):
    """The base class for all Model fields.
    These tell the Model how to construct Observables,
    Watchers, and SubModels at initialization.

    Treat these as `dataclasses.Field` and treat Model as
    an implicit `@dataclass`. They are not meant to be
    initialized directly. Users should typically use the
    respective exported functions: `watch` and `obs`.

    Upon Model initialization, Fields and references to them
    will be realized.
    """

    @abc.abstractmethod
    def realize(self, __model: "Model", __key: str, **__kwargs: Any) -> T:
        ...


class ObservableField[T](Field[Observable[T]]):
    """A common base class for all ObservableFields.

    These are the fields that will end up in a Model's
    __observables dictionary.
    """


class ObservableValueField[T](ObservableField[T]):
    """Defines a simple `Observable[T]` field.

    When realized, it creates an `Observable` with the value
    set to `default`, and `coerce` / `validate` set to
    `coerce_fn` / `validate_fn` respectively.

    Use `obs`, `coerce`, and `validate` to configure.
    """

    default: T
    coerce_fn: Callable[["Model", Any], T] | Callable[[Any], T]
    validate_fn: Callable[["Model", T], T] | Callable[[T], T]

    def __init__(self, default: T) -> None:
        super().__init__()
        self.default = default
        self.coerce_fn = type(default)
        self.validate_fn = noop

    def realize(self, model: "Model", key: str, **__kwargs: Any) -> Observable[T]:
        coerce_fn: Callable[[Any], Any] = bind_fn(self.coerce_fn, model)
        validate_fn: Callable[[Any], Any] = bind_fn(self.validate_fn, model)

        default = __kwargs.get(key, self.default)
        return Observable(default, coerce=coerce_fn, validate=validate_fn)


class SubmodelProperty[T]:
    """Defines a reference chain from a `SubmodelField` to an observable `Field`.

    Because we are following dataclass semantics, the class constructor is dealing
    in Fields, while the types are described as the instance members
    (i.e. we're lying about what the types are).

    Because `SubmodelField`s will show up as `Model` instances,
    the `Model` members are known to type checkers.`SubmodelField` and
    `SubmodelProperty` will recursively emit `SubmodelProperty` for
    arbitrary attribute accesses. These property chains are walked at
    Model initialization to realize the correct Observable.
    """

    root: "SubmodelField[Any] | SubmodelProperty[Any]"
    name: str

    def __init__(
        self, __root: "SubmodelField[Any] | SubmodelProperty[Any]", __name: str
    ) -> None:
        self.root = __root
        self.name = __name

    def __getattr__(self, __name: str) -> Any:
        return SubmodelProperty(self, __name)


class ObservableWatchField[T](ObservableField[T]):
    """Defines an `Observable[T]` which evaluates a callback
    in response to any changes to the provided observables.

    You can pass either Observables or observable Fields
    into the `observables` list. These will be realized when
    the Model is initialized.
    """

    fn: Callable[..., T]
    observables: list["ObservableField[Any] | SubmodelProperty[Any]"]

    def __init__(
        self,
        fn: Callable[..., T],
        observables: list["ObservableField[Any] | SubmodelProperty[Any]"],
    ) -> None:
        super().__init__()
        self.fn = fn
        self.observables = observables

    def realize(self, __model: "Model", __key: str, **__kwargs: Any) -> Observable[T]:
        fn = bind_fn(self.fn, __model)
        observable = Observable[T](fn(), coerce=noop)

        def __fn(*__args: Any, **__kwargs: Any) -> None:
            observable.set(fn())

        for o in [__model.find_observable(field) for field in self.observables]:
            o.watch(__fn)

        return observable


class SubmodelField[T: "Model"](Field[T]):
    """Defines a submodel.

    Upon Model initialization, `factory` will be called with `kwds`
    in order to construct a new child Model.

    Use `obs(__factory: Model, **kwargs)`
    """

    factory: type[T]
    kwds: dict[str, Any]

    def __init__(self, factory: type[T], **kwds: Any) -> None:
        super().__init__()
        self.factory = factory
        self.kwds = kwds

    def __getattr__(self, __name: str) -> Any:
        return SubmodelProperty(self, __name)

    def realize(self, __model: "Model", __key: str, **__kwargs: Any) -> T:
        return self.factory(**self.kwds, **__kwargs.get(__key, {}))
