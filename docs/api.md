# Table of Contents

* [yggy.model.model](#yggy.model.model)
  * [Model](#yggy.model.model.Model)
    * [\_\_post\_init\_\_](#yggy.model.model.Model.__post_init__)
    * [\_\_str\_\_](#yggy.model.model.Model.__str__)
    * [\_\_json\_\_](#yggy.model.model.Model.__json__)
    * [id](#yggy.model.model.Model.id)
    * [field\_values](#yggy.model.model.Model.field_values)
    * [observables](#yggy.model.model.Model.observables)
    * [load\_schema](#yggy.model.model.Model.load_schema)
    * [find\_observable](#yggy.model.model.Model.find_observable)
* [yggy.model.fields](#yggy.model.fields)
  * [Field](#yggy.model.fields.Field)
  * [ObservableField](#yggy.model.fields.ObservableField)
  * [ObservableValueField](#yggy.model.fields.ObservableValueField)
  * [SubmodelProperty](#yggy.model.fields.SubmodelProperty)
  * [ObservableWatchField](#yggy.model.fields.ObservableWatchField)
  * [SubmodelField](#yggy.model.fields.SubmodelField)
* [yggy.model.field\_funcs](#yggy.model.field_funcs)
  * [obs](#yggy.model.field_funcs.obs)
  * [obs](#yggy.model.field_funcs.obs)
  * [watch](#yggy.model.field_funcs.watch)
  * [coerce](#yggy.model.field_funcs.coerce)
  * [validate](#yggy.model.field_funcs.validate)
* [yggy.utils.functools](#yggy.utils.functools)
  * [FnType](#yggy.utils.functools.FnType)
    * [FREE\_FUNCTION](#yggy.utils.functools.FnType.FREE_FUNCTION)
    * [INSTANCE\_METHOD](#yggy.utils.functools.FnType.INSTANCE_METHOD)
    * [CLASS\_METHOD](#yggy.utils.functools.FnType.CLASS_METHOD)
  * [fn\_type](#yggy.utils.functools.fn_type)
  * [bind\_fn](#yggy.utils.functools.bind_fn)
* [yggy.comm.comm](#yggy.comm.comm)
  * [Comm](#yggy.comm.comm.Comm)
    * [id](#yggy.comm.comm.Comm.id)
    * [run](#yggy.comm.comm.Comm.run)
    * [start](#yggy.comm.comm.Comm.start)
    * [stop](#yggy.comm.comm.Comm.stop)
    * [add\_sender](#yggy.comm.comm.Comm.add_sender)
    * [new\_client\_id](#yggy.comm.comm.Comm.new_client_id)
    * [add\_client](#yggy.comm.comm.Comm.add_client)
    * [remove\_client](#yggy.comm.comm.Comm.remove_client)
    * [send](#yggy.comm.comm.Comm.send)
    * [revoke](#yggy.comm.comm.Comm.revoke)
    * [notify](#yggy.comm.comm.Comm.notify)
    * [recv](#yggy.comm.comm.Comm.recv)
    * [recv](#yggy.comm.comm.Comm.recv)

<a id="yggy.model.model"></a>

# yggy.model.model

<a id="yggy.model.model.Model"></a>

## Model Objects

```python
class Model()
```

A base class for managing an observable data model.

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

<a id="yggy.model.model.Model.__post_init__"></a>

#### \_\_post\_init\_\_

```python
def __post_init__() -> None
```

Like a standard `@dataclass`, override `__post_init__`
to include custom initialization logic after the default
intialization is complete.

<a id="yggy.model.model.Model.__str__"></a>

#### \_\_str\_\_

```python
def __str__() -> str
```

Returns a neatly nested hierarchy of fields

<a id="yggy.model.model.Model.__json__"></a>

#### \_\_json\_\_

```python
def __json__() -> ModelSchema
```

Returns a json serializable `ModelSchema`

<a id="yggy.model.model.Model.id"></a>

#### id

```python
@property
def id() -> str
```

The unique id for this `Model` instance

<a id="yggy.model.model.Model.field_values"></a>

#### field\_values

```python
@property
def field_values() -> dict[str, "Observable[Any] | Model"]
```

A `dict` mapping field names to their respective `Observable` or `Model`

<a id="yggy.model.model.Model.observables"></a>

#### observables

```python
@property
def observables() -> Iterator[Observable[Any]]
```

An iterator for all `Observable`s in the Model's hierarchy.
This includes both direct and indirect descendants.

```python
import yggy as yg

comm = yg.Comm()
network = yg.ObservableNetwork(comm)
person = PersonModel()

network.register(person.observables)
comm.start()
```

<a id="yggy.model.model.Model.load_schema"></a>

#### load\_schema

```python
def load_schema(__schema: ModelSchema) -> None
```

Loads values for all descendant `Observable`s.

This exlcudes fields defined by `ObservableWatchField`
as these will be recomputed anyway (and may have altered
callbacks since their last run).

<a id="yggy.model.model.Model.find_observable"></a>

#### find\_observable

```python
def find_observable(
    field: Observable[T] | ObservableField[T] | SubmodelProperty[T]
) -> Observable[T]
```

Finds an `Observable` based on a provided field.

The field may be:
- An `ObservableField` used to initialize an `Observable` on `self`
- A `SubmodelProperty` which resolves to a `SubmodelField` on `self`
- An existing `Observable` (which will be returned unaltered)

**Arguments**:

- `field` - The field to lookup an `Observable` for
  

**Returns**:

  The matched `Observable`

<a id="yggy.model.fields"></a>

# yggy.model.fields

<a id="yggy.model.fields.Field"></a>

## Field Objects

```python
class Field()
```

The base class for all Model fields.
These tell the Model how to construct Observables,
Watchers, and SubModels at initialization.

Treat these as `dataclasses.Field` and treat Model as
an implicit `dataclass`. They are not meant to be
initialized directly. Users should typically use the
respective exported functions: `watch` and `obs`.

Upon Model initialization, `Field`s and references to them
will be realized.

<a id="yggy.model.fields.ObservableField"></a>

## ObservableField Objects

```python
class ObservableField()
```

A common base class for all `ObservableField`s.

These are the fields that will end up in a `Model`'s
`__observables` dictionary.

<a id="yggy.model.fields.ObservableValueField"></a>

## ObservableValueField Objects

```python
class ObservableValueField()
```

Defines a simple `Observable[T]` field.

When realized, it creates an `Observable` with the value
set to `default`, and `coerce` / `validate` set to
`coerce_fn` / `validate_fn` respectively.

Use `obs`, `coerce`, and `validate` to configure.

<a id="yggy.model.fields.SubmodelProperty"></a>

## SubmodelProperty Objects

```python
class SubmodelProperty()
```

Defines a reference chain from a `SubmodelField` to an observable `Field`.

Because we are following dataclass semantics, the class constructor is dealing
in `Field`s, while the types are described as the instance members
(i.e. we're lying about what the types are).

Because `SubmodelField`s will show up as `Model` instances,
the `Model` members are known to type checkers.`SubmodelField` and
`SubmodelProperty` will recursively emit `SubmodelProperty` for
arbitrary attribute accesses. These property chains are walked at
Model initialization to realize the correct Observable.

<a id="yggy.model.fields.ObservableWatchField"></a>

## ObservableWatchField Objects

```python
class ObservableWatchField()
```

Defines an `Observable[T]` which evaluates a callback
in response to any changes to the provided observables.

You can pass either Observables or observable Fields
into the `observables` list. These will be realized when
the `Model` is initialized.

<a id="yggy.model.fields.SubmodelField"></a>

## SubmodelField Objects

```python
class SubmodelField()
```

Defines a submodel.

Upon Model initialization, `factory` will be called with `kwargs`
in order to construct a new child `Model`.

Use `obs(__factory: Model, **kwargs)`

<a id="yggy.model.field_funcs"></a>

# yggy.model.field\_funcs

<a id="yggy.model.field_funcs.obs"></a>

#### obs

```python
@overload
def obs(__factory: type[T], **__kwds: Any) -> T
```

Creates a `SubmodelField[T]` which describes how to
initialize a sub-`Model` at `Model` initialization.

Any argument assignable to the `Model` constructor can be
passed in as additional arguments to this function.

This actually returns a `.fields.SubmodelField[T]` rather than
the indicated type. However, this field will be realized into
the indicated type at `Model` initialization.

**Arguments**:

- `__factory` - A subclass of `Model`
- `**__kwds` - Arguments used to initialize `Model`
  

**Returns**:

  We pretend it returns `T`
  but it really returns `SubmodelField[T]`

<a id="yggy.model.field_funcs.obs"></a>

#### obs

```python
@overload
def obs(__value: T) -> Observable[T]
```

Creates an `ObservableValueField[T]` which describes how to
initialize an `Observable[T]` at `Model` initialization.

This actually returns a `.fields.ObservableValueField[T]` rather
than the indicated type. However, this field will be realized
into the indicated type at `Model` initialization.

**Arguments**:

- `__value` - The initial value of the `Observable`
  

**Returns**:

  We pretend it returns `Observable[T]`
  but it really returns `ObservableValueField[T]`

<a id="yggy.model.field_funcs.watch"></a>

#### watch

```python
def watch(
    *__observables:
    Observable[Any] | ObservableField[Any] | SubmodelProperty[Any]
) -> Callable[[Callable[..., T]], Observable[T]]
```

Creates an `ObservableWatchField[T]` which describes how to
initialize an `Observable[T]` which is automatically updated based
on a callback function at `Model` initialization.

Can be used for either simple callbacks that respond to the provided
`Observable`s, or to create a computed `Observable` who's value is the
result of that callback function.

This actually returns a `.fields.ObservableWatchField[T]` rather
than the indicated type. However, this field will be realized
into the indicated type at `Model` initialization.

**Arguments**:

- `*__observables` - The `Observable`s to watch
  

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

<a id="yggy.model.field_funcs.coerce"></a>

#### coerce

```python
def coerce(
    __obs: Observable[T] | ObservableValueField[T]
) -> Callable[[Callable[[Any, Any], T]], None]
```

Declares a custom coerce function for an `Observable`.

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

<a id="yggy.model.field_funcs.validate"></a>

#### validate

```python
def validate(
    __obs: Observable[T] | ObservableValueField[T]
) -> Callable[[Callable[[Any, T], T]], None]
```

Declares a custom validate function for an `Observable`.

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

<a id="yggy.utils.functools"></a>

# yggy.utils.functools

<a id="yggy.utils.functools.FnType"></a>

## FnType Objects

```python
class FnType(Enum)
```

<a id="yggy.utils.functools.FnType.FREE_FUNCTION"></a>

#### FREE\_FUNCTION

```python
FREE_FUNCTION = 1
```

The function has no member argument

<a id="yggy.utils.functools.FnType.INSTANCE_METHOD"></a>

#### INSTANCE\_METHOD

```python
INSTANCE_METHOD = 2
```

The function has a `self` member argument

<a id="yggy.utils.functools.FnType.CLASS_METHOD"></a>

#### CLASS\_METHOD

```python
CLASS_METHOD = 3
```

The function has a `cls` member argument

<a id="yggy.utils.functools.fn_type"></a>

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

<a id="yggy.utils.functools.bind_fn"></a>

#### bind\_fn

```python
def bind_fn(fn: Callable[..., Any], self: object) -> Callable[..., Any]
```

Given an unbound function, binds it to the given `self` object (if applicable).
This is used to normalize free function / method / class method calls downstream.

**Arguments**:

- `fn` - The function to bind
- `self` - The object to bind to
  

**Returns**:

  The bound (or original) function

<a id="yggy.comm.comm"></a>

# yggy.comm.comm

<a id="yggy.comm.comm.Comm"></a>

## Comm Objects

```python
class Comm()
```

`Comm` manages communication for all objects in yggy.

A `Comm` can send messages both locally, or locally+remote.

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

<a id="yggy.comm.comm.Comm.id"></a>

#### id

```python
@property
def id() -> str
```

The unique id for this `Comm` instance

<a id="yggy.comm.comm.Comm.run"></a>

#### run

```python
def run() -> None
```

Run the message queue loop

<a id="yggy.comm.comm.Comm.start"></a>

#### start

```python
def start() -> None
```

Run the message queue loop on a separate thread

<a id="yggy.comm.comm.Comm.stop"></a>

#### stop

```python
def stop() -> None
```

Stop the message queue loop

<a id="yggy.comm.comm.Comm.add_sender"></a>

#### add\_sender

```python
def add_sender(__sender: SenderFn_t[Message]) -> None
```

Add a sender callback to the senders list

**Arguments**:

- `__sender` - The sender callback to add

<a id="yggy.comm.comm.Comm.new_client_id"></a>

#### new\_client\_id

```python
def new_client_id() -> str
```

Retrieve a new client id

**Returns**:

  A new client id

<a id="yggy.comm.comm.Comm.add_client"></a>

#### add\_client

```python
def add_client(__client_id: str) -> None
```

Add a new client to the clients list and notify

**Arguments**:

- `__client_id` - The client id to add

<a id="yggy.comm.comm.Comm.remove_client"></a>

#### remove\_client

```python
def remove_client(__client_id: str) -> None
```

Remove a client from the clients list and notify

**Arguments**:

- `__client_id` - The client id to remove

<a id="yggy.comm.comm.Comm.send"></a>

#### send

```python
def send(__msg: str, __data: Message, **__kwargs: Unpack[SendKwds]) -> None
```

Notify and place message on message queue

**Arguments**:

- `__msg` - The message to send
- `__data` - The message data to send
- `**__kwargs` - SendKwds
- `client_ids` - The client ids to send to (all if blank)

<a id="yggy.comm.comm.Comm.revoke"></a>

#### revoke

```python
def revoke(__id: str) -> None
```

Mark a message as revoked. A revoked message
will be skipped when dequeued.

**Arguments**:

- `__id` - The message id to revoke

<a id="yggy.comm.comm.Comm.notify"></a>

#### notify

```python
def notify(__msg: str, __data: Message) -> None
```

Notify local recievers with message

**Arguments**:

- `__msg` - The message to notify
- `__data` - The message data to notify

<a id="yggy.comm.comm.Comm.recv"></a>

#### recv

```python
@overload
def recv(__fn: GlobalReceiverFn_t[T]) -> None
```

Add a global receiver.

Global receivers are called for all messages.

**Arguments**:

- `__fn` - The global receiver to add

<a id="yggy.comm.comm.Comm.recv"></a>

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

