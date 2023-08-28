# Table of Contents

* [model.model](#model.model)
  * [Model](#model.model.Model)
* [model.fields](#model.fields)
  * [Field](#model.fields.Field)
  * [ObservableField](#model.fields.ObservableField)
  * [ObservableValueField](#model.fields.ObservableValueField)
  * [SubmodelProperty](#model.fields.SubmodelProperty)
  * [ObservableWatchField](#model.fields.ObservableWatchField)
  * [SubmodelField](#model.fields.SubmodelField)
* [model.field\_funcs](#model.field_funcs)
  * [obs](#model.field_funcs.obs)
  * [obs](#model.field_funcs.obs)
  * [watch](#model.field_funcs.watch)
  * [coerce](#model.field_funcs.coerce)
  * [validate](#model.field_funcs.validate)
* [observable.observable](#observable.observable)
  * [Observable](#observable.observable.Observable)
* [utils.functools](#utils.functools)
  * [FnType](#utils.functools.FnType)
  * [fn\_type](#utils.functools.fn_type)
  * [bind\_fn](#utils.functools.bind_fn)
* [comm.comm](#comm.comm)
  * [Comm](#comm.comm.Comm)

<a id="model.model"></a>

# model.model

<a id="model.model.Model"></a>

## Model

```python
class Model()
```

A base class for managing an observable data model.

This class is should primarily be constructed with [`Field`](#model.fields.Field) attributes.
Similar to a dataclass, these will exist as field definition types at class
construction time, but at instance initialization, these fields are
realized into the observable defined by the field.

There are also a number of decorators that can modify the behavior of
fields, such as [`coerce`](#model.field_funcs.coerce) and [`validate`](#model.field_funcs.validate).

In order for [`Observable`](#observable.observable.Observable) to be reactive, they must first be registered with
a [`ObservableNetwork`](#observable.observable_network.ObservableNetwork) (itself with an active [`Comm`](#comm.comm.Comm)). Use [`Model.observables`](#model.model.Model.observables)
to obtain an iterator of [`Observables`](#observable.observable.Observable) to pass to the [`ObservableNetwork`](#observable.observable_network.ObservableNetwork).

**Example**:

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

<a id="model.model.Model.__post_init__"></a>

#### \_\_post\_init\_\_

```python
def __post_init__() -> None
```

Like a standard `@dataclass`, override `__post_init__`
to include custom initialization logic after the default
intialization is complete.

<a id="model.model.Model.__str__"></a>

#### \_\_str\_\_

```python
def __str__() -> str
```

Returns a neatly nested hierarchy of fields

<a id="model.model.Model.__json__"></a>

#### \_\_json\_\_

```python
def __json__() -> ModelSchema
```

Returns a json serializable [`ModelSchema`](#builtins.ModelSchema)

<a id="model.model.Model.id"></a>

#### id

```python
@property
def id() -> str
```

The unique id for this [`Model`](#model.model.Model) instance

<a id="model.model.Model.field_values"></a>

#### field\_values

```python
@property
def field_values() -> dict[str, "Observable[Any] | Model"]
```

A `dict` mapping field names to their respective [`Observable`](#observable.observable.Observable) or [`Model`](#model.model.Model)

<a id="model.model.Model.observables"></a>

#### observables

```python
@property
def observables() -> Iterator[Observable[Any]]
```

An iterator for all [`Observables`](#observable.observable.Observable) in the [`Model`](#model.model.Model)'s hierarchy. This
includes both direct and indirect descendants.

```python
import yggy as yg

comm = yg.Comm()
network = yg.ObservableNetwork(comm)
person = PersonModel()

network.register(person.observables)
comm.start()
```

<a id="model.model.Model.load_schema"></a>

#### load\_schema

```python
def load_schema(__schema: ModelSchema) -> None
```

Loads values for all descendant [`Observables`](#observable.observable.Observable).

This exlcudes fields defined by [`ObservableWatchField`](#model.fields.ObservableWatchField) as these will be
recomputed anyway (and may have altered callbacks since their last run).

<a id="model.model.Model.find_observable"></a>

#### find\_observable

```python
def find_observable(
    field: Observable[T] | ObservableField[T] | SubmodelProperty[T]
) -> Observable[T]
```

Finds an [`Observable`](#observable.observable.Observable) based
on a provided field.

The field may be:
- A [`ObservableField`](#model.fields.ObservableField) used to initialize an [`Observable`](#observable.observable.Observable) on `self`
- A [`SubmodelProperty`](#model.fields.SubmodelProperty) which resolves to a [`SubmodelField`](#model.fields.SubmodelField) on
`self`
- An existing [`Observable`](#observable.observable.Observable) (which will be returned unaltered)

**Arguments**:

- `field` - The field to lookup an [`Observable`](#observable.observable.Observable) for
  

**Returns**:

  The matched [`Observable`](#observable.observable.Observable)

<a id="model.fields"></a>

# model.fields

<a id="model.fields.Field"></a>

## Field

```python
class Field()
```

The base class for all [`Model`](#model.model.Model) fields.
These tell the [`Model`](#model.model.Model) how to construct [`Observables`](#observable.observable.Observable),
Watchers, and SubModels at initialization.

Treat these as `dataclasses.Field` and treat [`Model`](#model.model.Model) as
an implicit `dataclass`. They are not meant to be
initialized directly. Users should typically use the
respective exported functions: [`watch`](#model.field_funcs.watch) and [`obs`](#model.field_funcs.obs).

Upon [`Model`](#model.model.Model) initialization, [`Fields`](#model.fields.Field) and references to them
will be realized.

<a id="model.fields.ObservableField"></a>

## ObservableField

```python
class ObservableField()
```

A common base class for all [`ObservableFields`](#model.fields.ObservableField).

These are the fields that will end up in a [`Models`](#model.model.Model)
`__observables` dictionary.

<a id="model.fields.ObservableValueField"></a>

## ObservableValueField

```python
class ObservableValueField()
```

Defines a simple [`Observable`](#observable.observable.Observable)[T] field.

When realized, it creates an [`Observable`](#observable.observable.Observable) with the value
set to `default`, and `coerce` / `validate` set to
`coerce_fn` / `validate_fn` respectively.

Use [`obs`](#model.field_funcs.obs), [`coerce`](#model.field_funcs.coerce), and [`validate`](#model.field_funcs.validate) to configure.

<a id="model.fields.SubmodelProperty"></a>

## SubmodelProperty

```python
class SubmodelProperty()
```

Defines a reference chain from a [`SubmodelField`](#model.fields.SubmodelField) to an observable [`Field`](#model.fields.Field).

Because we are following dataclass semantics, the class constructor is dealing
in [`Fields`](#model.fields.Field), while the types are described as the instance members
(i.e. we're lying about what the types are).

Because [`SubmodelFields`](#model.fields.SubmodelField) will show up as [`Model`](#model.model.Model) instances,
the [`Model`](#model.model.Model) members are known to type checkers. [`SubmodelField`](#model.fields.SubmodelField) and
[`SubmodelProperty`](#model.fields.SubmodelProperty) will recursively emit [`SubmodelProperty`](#model.fields.SubmodelProperty) for
arbitrary attribute accesses. These property chains are walked at
[`Model`](#model.model.Model) initialization to realize the correct [`Observable`](#observable.observable.Observable).

<a id="model.fields.ObservableWatchField"></a>

## ObservableWatchField

```python
class ObservableWatchField()
```

Defines an [`Observable`](#observable.observable.Observable)[T] which evaluates a callback
in response to any changes to the provided observables.

You can pass either [`Observables`](#observable.observable.Observable) or [`ObservableFields`](#model.fields.ObservableField)
into the `observables` list. These will be realized when
the [`Model`](#model.model.Model) is initialized.

<a id="model.fields.SubmodelField"></a>

## SubmodelField

```python
class SubmodelField()
```

Defines a submodel.

Upon [`Model`](#model.model.Model) initialization, `factory` will be called with `kwargs`
in order to construct a new child [`Model`](#model.model.Model).

Use `obs(__factory: Model, **kwargs)`

<a id="model.field_funcs"></a>

# model.field\_funcs

<a id="model.field_funcs.obs"></a>

#### obs

```python
@overload
def obs(__factory: type[T], **__kwds: Any) -> T
```

Creates a [`SubmodelField`](#model.fields.SubmodelField)[T] which describes how to
initialize a sub-[`Model`](#model.model.Model) at [`Model`](#model.model.Model) initialization.

Any argument assignable to the [`Model`](#model.model.Model) constructor can be
passed in as additional arguments to this function.

This actually returns a [`SubmodelField`](#model.fields.SubmodelField)[T] rather than
the indicated type. However, this field will be realized into
the indicated type at [`Model`](#model.model.Model) initialization.

**Arguments**:

- `__factory` - A subclass of [`Model`](#model.model.Model)
- `**__kwds` - Arguments used to initialize [`Model`](#model.model.Model)
  

**Returns**:

  We pretend it returns `T`
  but it really returns [`SubmodelField`](#model.fields.SubmodelField)[T]

<a id="model.field_funcs.obs"></a>

#### obs

```python
@overload
def obs(__value: T) -> Observable[T]
```

Creates a [`ObservableValueField`](#model.fields.ObservableValueField)[T] which describes how to
initialize an [`Observable`](#observable.observable.Observable)[T] at [`Model`](#model.model.Model) initialization.

This actually returns a [`ObservableValueField`](#model.fields.ObservableValueField)[T] rather
than the indicated type. However, this field will be realized
into the indicated type at [`Model`](#model.model.Model) initialization.

**Arguments**:

- `__value` - The initial value of the [`Observable`](#observable.observable.Observable)
  

**Returns**:

  We pretend it returns [`Observable`](#observable.observable.Observable)[T]
  but it really returns [`ObservableValueField`](#model.fields.ObservableValueField)[T]

<a id="model.field_funcs.watch"></a>

#### watch

```python
def watch(
    *__observables:
    Observable[Any] | ObservableField[Any] | SubmodelProperty[Any]
) -> Callable[[Callable[..., T]], Observable[T]]
```

Creates a [`ObservableWatchField`](#model.fields.ObservableWatchField)[T] which describes how to
initialize an [`Observable`](#observable.observable.Observable)[T] which is automatically updated based
on a callback function at [`Model`](#model.model.Model) initialization.

Can be used for either simple callbacks that respond to the provided
[`Observables`](#observable.observable.Observable), or to create a computed [`Observable`](#observable.observable.Observable) who's value is the
result of that callback function.

This actually returns a [`ObservableWatchField`](#model.fields.ObservableWatchField)[T] rather
than the indicated type. However, this field will be realized
into the indicated type at [`Model`](#model.model.Model) initialization.

**Arguments**:

- `*__observables` - The [`Observables`](#observable.observable.Observable) to watch
  

**Returns**:

  A function which takes the callback function as it's only parameter.
  To be used as a decorator.
  

**Example**:

```python
class Person(yg.Model):
    fname = yg.obs("")
    lname = yg.obs("")

    @yg.watch(fname, lname)
    def full_name(self) -> str:
        return f"{self.fname.get()} {self.lname.get()}"
```

<a id="model.field_funcs.coerce"></a>

#### coerce

```python
def coerce(
    __obs: Observable[T] | ObservableValueField[T]
) -> Callable[[Callable[[Any, Any], T]], None]
```

Declares a custom coerce function for an [`Observable`](#observable.observable.Observable).

**Returns**:

  A function which takes the coerce function as its only parameter.
  To be used as a decorator.
  

**Example**:

```python
class Foo(yg.Model):
    bar = yg.obs(0)

    @yg.coerce(bar)
    def _(self, __bar: Any) -> int:
        return int(float(__bar)) # parse float strings to int
```

<a id="model.field_funcs.validate"></a>

#### validate

```python
def validate(
    __obs: Observable[T] | ObservableValueField[T]
) -> Callable[[Callable[[Any, T], T]], None]
```

Declares a custom validate function for an [`Observable`](#observable.observable.Observable).

**Returns**:

  A function which takes the validate function as its only parameter.
  To be used as a decorator.
  

**Example**:

```python
class Slider(yg.Model):
    min_value = yg.obs(0)
    max_value = yg.obs(100)
    value = yg.obs(0)

    @yg.validate(value)
    def _(self, __value: int) -> int:
        __value = max(__value, self.min_value.get())
        __value = min(__value, self.max_value.get())
        return __value
```

<a id="observable.observable"></a>

# observable.observable

<a id="observable.observable.Observable"></a>

## Observable

```python
class Observable()
```

An observable primitive value.

When registered with an [`ObservableNetwork`](#observable.observable_network.ObservableNetwork) it will emit and receive
change messages through the [`Comm`](#comm.comm.Comm). When an [`Observable`](#observable.observable.Observable) recieves
a client change message, it will update its value and in turn
emit a change message.

While an [`Observable`](#observable.observable.Observable) may be created and registered manually,
it is advised to construct them as part of a [`Model`](#model.model.Model) through
the use of [`obs`](#model.field_funcs.obs) and related configuration functions.

TODO: make lazy messaging optional

<a id="utils.functools"></a>

# utils.functools

<a id="utils.functools.FnType"></a>

## FnType

```python
class FnType(Enum)
```

<a id="utils.functools.FnType.FREE_FUNCTION"></a>

#### FREE\_FUNCTION

The function has no member argument

<a id="utils.functools.FnType.INSTANCE_METHOD"></a>

#### INSTANCE\_METHOD

The function has a `self` member argument

<a id="utils.functools.FnType.CLASS_METHOD"></a>

#### CLASS\_METHOD

The function has a `cls` member argument

<a id="utils.functools.fn_type"></a>

#### fn\_type

```python
def fn_type(fn: Callable[..., Any]) -> FnType
```

Determines if a function should be treated as:
- a free function (1st parameter neither `self` or `cls`)
- a method (p1 `self`)
- a class method (p1 `cls`)

It's a highly opinionated function that makes many assumptions

**Arguments**:

- `fn` - The function to check
  

**Returns**:

  an enum classification

<a id="utils.functools.bind_fn"></a>

#### bind\_fn

```python
def bind_fn(fn: Callable[..., Any], self: object) -> Callable[..., Any]
```

Given an unbound function, binds it to the given `self` object (if
applicable). This is used to normalize free function / method / class
method calls downstream.

**Arguments**:

- `fn` - The function to bind
- `self` - The object to bind to
  

**Returns**:

  The bound (or original) function

<a id="comm.comm"></a>

# comm.comm

<a id="comm.comm.Comm"></a>

## Comm

```python
class Comm()
```

[`Comm`](#comm.comm.Comm) manages communication for all objects in yggy.

A [`Comm`](#comm.comm.Comm) can send messages both locally, or locally+remote.

Messages are notified locally immediately and synchronously,
while messages are sent remote through an asynchronous
message queue.

**Example**:

```python
import yggy as yg

comm = yg.Comm()

class MyMessage(yg.Message):
    data: str

@comm.recv("my.message")
def my_message(data: MyMessage) -> None:
    print("got data:", data["data"])

comm.start()

comm.send(
    "my.message",
    yg.create_message(MyMessage, {"data": "Hello, world."})
) # >> got data: Hello, world.
```

<a id="comm.comm.Comm.id"></a>

#### id

```python
@property
def id() -> str
```

The unique id for this [`Comm`](#comm.comm.Comm) instance

<a id="comm.comm.Comm.run"></a>

#### run

```python
def run() -> None
```

Run the message queue loop

<a id="comm.comm.Comm.start"></a>

#### start

```python
def start() -> None
```

Run the message queue loop on a separate thread

<a id="comm.comm.Comm.stop"></a>

#### stop

```python
def stop() -> None
```

Stop the message queue loop

<a id="comm.comm.Comm.add_sender"></a>

#### add\_sender

```python
def add_sender(__sender: SenderFn_t[Message]) -> None
```

Add a sender callback to the senders list

**Arguments**:

- `__sender` - The sender callback to add

<a id="comm.comm.Comm.new_client_id"></a>

#### new\_client\_id

```python
def new_client_id() -> str
```

Retrieve a new client id

**Returns**:

  A new client id

<a id="comm.comm.Comm.add_client"></a>

#### add\_client

```python
def add_client(__client_id: str) -> None
```

Add a new client to the clients list and notify

**Arguments**:

- `__client_id` - The client id to add

<a id="comm.comm.Comm.remove_client"></a>

#### remove\_client

```python
def remove_client(__client_id: str) -> None
```

Remove a client from the clients list and notify

**Arguments**:

- `__client_id` - The client id to remove

<a id="comm.comm.Comm.notify"></a>

#### notify

```python
def notify(__msg: str, __data: Message) -> None
```

Notify local recievers with message

**Arguments**:

- `__msg` - The message to notify
- `__data` - The message data to notify

<a id="comm.comm.Comm.send"></a>

#### send

```python
def send(__msg: str, __data: Message | LazyMessage[Any],
         **__kwargs: Unpack[SendKwds]) -> None
```

Place message on message queue

**Arguments**:

- `__msg` - The message to send
- `__data` - The message data to send
- `**__kwargs` - [`SendKwds`](#comm.comm.SendKwds)
- `client_ids` - The client ids to send to (all if blank)

<a id="comm.comm.Comm.emit"></a>

#### emit

```python
def emit(__msg: str, __data: Message | LazyMessage[Any],
         **__kwargs: Unpack[SendKwds]) -> None
```

Notify and send message

**Arguments**:

- `__msg` - The message to emit
- `__data` - The message data to emit
- `**__kwargs` - [`SendKwds`](#comm.comm.SendKwds)
- `client_ids` - The client ids to send to (all if blank)

<a id="comm.comm.Comm.revoke"></a>

#### revoke

```python
def revoke(__id: str) -> None
```

Mark a message as revoked. A revoked message
will be skipped when dequeued.

**Arguments**:

- `__id` - The message id to revoke

<a id="comm.comm.Comm.recv"></a>

#### recv

```python
@overload
def recv(__fn: GlobalReceiverFn_t[T]) -> None
```

Add a global receiver.

Global receivers are called for all messages.

**Arguments**:

- `__fn` - The global receiver to add

<a id="comm.comm.Comm.recv"></a>

#### recv

```python
@overload
def recv(__msg: str, __fn: ReceiverFn_t[T]) -> None
```

Add a named receiver.

Named receivers are called for all messages
sent to the given message name.

**Arguments**:

- `__msg` - The message name
- `__fn` - The receiver to add

