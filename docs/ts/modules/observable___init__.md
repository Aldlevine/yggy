[yggy](../README.md) / [Modules](../modules.md) / observable/\_\_init\_\_

# Module: observable/\_\_init\_\_

## Table of contents

### Classes

- [ObservableNetwork](../classes/observable___init__.ObservableNetwork.md)

### Type Aliases

- [ChangeMessage](observable___init__.md#changemessage)
- [ClientChangeMessage](observable___init__.md#clientchangemessage)
- [Observable](observable___init__.md#observable)
- [ObservableDict](observable___init__.md#observabledict)
- [ObservableOr](observable___init__.md#observableor)
- [ObservableOrDict](observable___init__.md#observableordict)
- [ObservableOrTuple](observable___init__.md#observableortuple)
- [ObservableSchema](observable___init__.md#observableschema)
- [ObservableTuple](observable___init__.md#observabletuple)
- [Primitive](observable___init__.md#primitive)
- [PrimitiveOf](observable___init__.md#primitiveof)
- [Primitives](observable___init__.md#primitives)
- [RegisterMessage](observable___init__.md#registermessage)
- [TransformFn](observable___init__.md#transformfn)

### Variables

- [OBSERVABLE\_CHANGE\_MSG](observable___init__.md#observable_change_msg)
- [OBSERVABLE\_CLIENT\_CHANGE\_MSG](observable___init__.md#observable_client_change_msg)
- [OBSERVABLE\_REGISTER\_MSG](observable___init__.md#observable_register_msg)

### Functions

- [Observable](observable___init__.md#observable-1)

## Type Aliases

### ChangeMessage

Ƭ **ChangeMessage**<`T`\>: [`Message`](comm___init__.md#message) & { `data_id`: `string` ; `new_value`: `T`  }

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[observable/messages.ts:7](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/messages.ts#L7)

___

### ClientChangeMessage

Ƭ **ClientChangeMessage**<`T`\>: [`ChangeMessage`](observable___init__.md#changemessage)<`T`\> & {}

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[observable/messages.ts:12](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/messages.ts#L12)

___

### Observable

Ƭ **Observable**<`T`, `O`\>: `_Observable`<`T`\> & { [P in keyof O]: O[P] extends Function ? ObservableFunction<O[P]\> : O[P] extends Primitive ? Observable<O[P]\> : never }

An [Observable](observable___init__.md#observable-1) which provides a reactive
interface to an underlying data type. Proxies 
the methods associtated with the underlying data
type such that they return [Observable](observable___init__.md#observable-1)s
with equivalent value, and allow both [Primitive](observable___init__.md#primitive)s,
and [Observable](observable___init__.md#observable-1)s as arguments.

**`Export`**

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `T` |
| `O` | extends `ObjectOf`<`T`\> = `ObjectOf`<`T`\> |

#### Defined in

[observable/observable.ts:366](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/observable.ts#L366)

[observable/observable.ts:380](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/observable.ts#L380)

___

### ObservableDict

Ƭ **ObservableDict**<`T`\>: { [P in keyof T]: Observable<T[P]\> }

Convert a dict of T to a dict of [Observable](observable___init__.md#observable-1)<T>

**`Export`**

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Object` |

#### Defined in

[observable/observable.ts:163](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/observable.ts#L163)

___

### ObservableOr

Ƭ **ObservableOr**<`T`\>: [`Observable`](observable___init__.md#observable-1)<`T`\> \| `T`

Either an [Observable](observable___init__.md#observable-1)<T> or T

**`Export`**

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[observable/observable.ts:125](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/observable.ts#L125)

___

### ObservableOrDict

Ƭ **ObservableOrDict**<`T`\>: { [P in keyof T]: ObservableOr<T[P]\> }

Convert a dict of T to a dict of [ObservableOr](observable___init__.md#observableor)<T>

**`Export`**

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Object` |

#### Defined in

[observable/observable.ts:173](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/observable.ts#L173)

___

### ObservableOrTuple

Ƭ **ObservableOrTuple**<`T`\>: { [P in keyof T]: ObservableOr<T[P]\> }

Convert a tuple of T to a tuple of [ObservableOr](observable___init__.md#observableor)<T>

**`Export`**

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`Primitive`](observable___init__.md#primitive)[] |

#### Defined in

[observable/observable.ts:152](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/observable.ts#L152)

___

### ObservableSchema

Ƭ **ObservableSchema**<`T`\>: `Object`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Type declaration

| Name | Type |
| :------ | :------ |
| `data_id` | `string` |
| `value` | `T` |

#### Defined in

[observable/schema.ts:1](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/schema.ts#L1)

___

### ObservableTuple

Ƭ **ObservableTuple**<`T`\>: { [P in keyof T]: Observable<T[P]\> }

Convert a tuple of T to a tuple of [Observable](observable___init__.md#observable-1)<T>

**`Export`**

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`Primitive`](observable___init__.md#primitive)[] |

#### Defined in

[observable/observable.ts:142](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/observable.ts#L142)

___

### Primitive

Ƭ **Primitive**: [`Primitives`](observable___init__.md#primitives)[`number`]

Union of primitive types supported by [Observable](observable___init__.md#observable-1)

**`Export`**

#### Defined in

[observable/observable.ts:50](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/observable.ts#L50)

___

### PrimitiveOf

Ƭ **PrimitiveOf**<`T`\>: `T` extends `boolean` ? `boolean` : `T` extends `number` ? `number` : `T` extends `string` ? `string` : `never`

Converts a possible literal primitive to a [Primitive](observable___init__.md#primitive)

**`Export`**

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`Primitive`](observable___init__.md#primitive) |

#### Defined in

[observable/observable.ts:58](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/observable.ts#L58)

___

### Primitives

Ƭ **Primitives**: [`void`, `boolean`, `number`, `string`]

Tuple of primitive types supported by [Observable](observable___init__.md#observable-1)

**`Export`**

#### Defined in

[observable/observable.ts:42](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/observable.ts#L42)

___

### RegisterMessage

Ƭ **RegisterMessage**<`T`\>: [`Message`](comm___init__.md#message) & { `data_id`: `string` ; `value`: `T`  }

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[observable/messages.ts:14](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/messages.ts#L14)

___

### TransformFn

Ƭ **TransformFn**<`From`, `To`\>: (`v`: `From`) => `To`

#### Type parameters

| Name |
| :------ |
| `From` |
| `To` |

#### Type declaration

▸ (`v`): `To`

Any function that transforms an object of type From to type To

##### Parameters

| Name | Type |
| :------ | :------ |
| `v` | `From` |

##### Returns

`To`

**`Export`**

#### Defined in

[observable/observable.ts:34](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/observable.ts#L34)

## Variables

### OBSERVABLE\_CHANGE\_MSG

• `Const` **OBSERVABLE\_CHANGE\_MSG**: ``"observable.change"``

#### Defined in

[observable/messages.ts:3](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/messages.ts#L3)

___

### OBSERVABLE\_CLIENT\_CHANGE\_MSG

• `Const` **OBSERVABLE\_CLIENT\_CHANGE\_MSG**: ``"observable.client_change"``

#### Defined in

[observable/messages.ts:4](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/messages.ts#L4)

___

### OBSERVABLE\_REGISTER\_MSG

• `Const` **OBSERVABLE\_REGISTER\_MSG**: ``"observable.register"``

#### Defined in

[observable/messages.ts:5](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/messages.ts#L5)

## Functions

### Observable

▸ **Observable**<`T`\>(`v`, `kwds?`): [`Observable`](observable___init__.md#observable-1)<`T`, `ObjectOf`<`T`\>\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `v` | `T` | the initial value |
| `kwds?` | `ObservableKwds` | - |

#### Returns

[`Observable`](observable___init__.md#observable-1)<`T`, `ObjectOf`<`T`\>\>

the observable

#### Defined in

[observable/observable.ts:193](https://github.com/Aldlevine/yggy/blob/8bc8567/src/observable/observable.ts#L193)
