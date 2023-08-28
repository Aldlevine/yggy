[yggy](../README.md) / [Modules](../modules.md) / [observable/\_\_init\_\_](../modules/observable___init__.md) / Observable

# Class: Observable<T\>

[observable/__init__](../modules/observable___init__.md).Observable

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Constructors

- [constructor](observable___init__.Observable.md#constructor)

### Properties

- [#id](observable___init__.Observable.md##id)
- [#local](observable___init__.Observable.md##local)
- [#network](observable___init__.Observable.md##network)
- [#receivers](observable___init__.Observable.md##receivers)
- [#value](observable___init__.Observable.md##value)

### Accessors

- [id](observable___init__.Observable.md#id)
- [network](observable___init__.Observable.md#network)

### Methods

- [#notify\_change](observable___init__.Observable.md##notify_change)
- [\_\_recv\_change](observable___init__.Observable.md#__recv_change)
- [get](observable___init__.Observable.md#get)
- [register](observable___init__.Observable.md#register)
- [set](observable___init__.Observable.md#set)
- [watch](observable___init__.Observable.md#watch)
- [from\_schema](observable___init__.Observable.md#from_schema)

## Constructors

### constructor

• **new Observable**<`T`\>(`__id`, `__value`, `__kwds?`)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__id` | `string` |
| `__value` | `T` |
| `__kwds` | `ObservableKwds` |

#### Defined in

[observable/observable.ts:25](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L25)

## Properties

### #id

• `Private` **#id**: `string`

#### Defined in

[observable/observable.ts:20](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L20)

___

### #local

• `Private` **#local**: `boolean`

#### Defined in

[observable/observable.ts:23](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L23)

___

### #network

• `Private` `Optional` **#network**: [`ObservableNetwork`](observable___init__.ObservableNetwork.md)

#### Defined in

[observable/observable.ts:19](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L19)

___

### #receivers

• `Private` **#receivers**: [`IterableWeakMap`](utils___init__.weakref.IterableWeakMap.md)<[`ReceiverFn_t`](../modules/comm___init__.md#receiverfn_t), [`ReceiverFn_t`](../modules/comm___init__.md#receiverfn_t)\>

#### Defined in

[observable/observable.ts:22](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L22)

___

### #value

• `Private` **#value**: `T`

#### Defined in

[observable/observable.ts:21](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L21)

## Accessors

### id

• `get` **id**(): `string`

#### Returns

`string`

#### Defined in

[observable/observable.ts:32](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L32)

___

### network

• `get` **network**(): `void` \| [`ObservableNetwork`](observable___init__.ObservableNetwork.md)

#### Returns

`void` \| [`ObservableNetwork`](observable___init__.ObservableNetwork.md)

#### Defined in

[observable/observable.ts:36](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L36)

## Methods

### #notify\_change

▸ `Private` **#notify_change**(): `void`

#### Returns

`void`

#### Defined in

[observable/observable.ts:72](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L72)

___

### \_\_recv\_change

▸ **__recv_change**(`change`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `change` | [`ChangeMessage`](../modules/observable___init__.md#changemessage)<`T`\> |

#### Returns

`void`

#### Defined in

[observable/observable.ts:86](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L86)

___

### get

▸ **get**(): `T`

#### Returns

`T`

#### Defined in

[observable/observable.ts:51](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L51)

___

### register

▸ **register**(`__network`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__network` | [`ObservableNetwork`](observable___init__.ObservableNetwork.md) |

#### Returns

`void`

#### Defined in

[observable/observable.ts:44](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L44)

___

### set

▸ **set**(`__value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__value` | `T` |

#### Returns

`void`

#### Defined in

[observable/observable.ts:55](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L55)

___

### watch

▸ **watch**(`__fn`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__fn` | [`ReceiverFn_t`](../modules/comm___init__.md#receiverfn_t) |

#### Returns

`void`

#### Defined in

[observable/observable.ts:62](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L62)

___

### from\_schema

▸ `Static` **from_schema**<`T`\>(`__schema`): [`Observable`](observable___init__.Observable.md)<`T`\>

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `__schema` | [`ObservableSchema`](../modules/observable___init__.md#observableschema)<`T`\> |

#### Returns

[`Observable`](observable___init__.Observable.md)<`T`\>

#### Defined in

[observable/observable.ts:40](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L40)
