[yggy](../README.md) / [Modules](../modules.md) / [observable/\_\_init\_\_](../modules/observable___init__.md) / ObservableNetwork

# Class: ObservableNetwork

[observable/__init__](../modules/observable___init__.md).ObservableNetwork

## Table of contents

### Constructors

- [constructor](observable___init__.ObservableNetwork.md#constructor)

### Properties

- [#comm](observable___init__.ObservableNetwork.md##comm)
- [#registry](observable___init__.ObservableNetwork.md##registry)
- [#updating](observable___init__.ObservableNetwork.md##updating)

### Accessors

- [comm](observable___init__.ObservableNetwork.md#comm)

### Methods

- [#recv\_change](observable___init__.ObservableNetwork.md##recv_change)
- [get](observable___init__.ObservableNetwork.md#get)
- [notify\_change](observable___init__.ObservableNetwork.md#notify_change)
- [register](observable___init__.ObservableNetwork.md#register)
- [send\_change](observable___init__.ObservableNetwork.md#send_change)

## Constructors

### constructor

• **new ObservableNetwork**(`comm`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `comm` | [`Comm`](comm___init__.Comm.md) |

#### Defined in

[observable/observable_network.ts:14](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/observable/observable_network.ts#L14)

## Properties

### #comm

• `Private` **#comm**: [`Comm`](comm___init__.Comm.md)

#### Defined in

[observable/observable_network.ts:12](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/observable/observable_network.ts#L12)

___

### #registry

• `Private` **#registry**: `Object`

#### Index signature

▪ [key: `string`]: [`Observable`](../modules/observable___init__.md#observable-1)<`any`\>

#### Defined in

[observable/observable_network.ts:10](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/observable/observable_network.ts#L10)

___

### #updating

• `Private` **#updating**: `Set`<`string`\>

#### Defined in

[observable/observable_network.ts:11](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/observable/observable_network.ts#L11)

## Accessors

### comm

• `get` **comm**(): [`Comm`](comm___init__.Comm.md)

#### Returns

[`Comm`](comm___init__.Comm.md)

#### Defined in

[observable/observable_network.ts:22](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/observable/observable_network.ts#L22)

## Methods

### #recv\_change

▸ `Private` **#recv_change**<`T`\>(`change`): `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `change` | [`ChangeMessage`](../modules/observable___init__.md#changemessage)<`T`\> |

#### Returns

`void`

#### Defined in

[observable/observable_network.ts:47](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/observable/observable_network.ts#L47)

___

### get

▸ **get**<`T`\>(`id`): `undefined` \| [`Observable`](../modules/observable___init__.md#observable-1)<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `string` \| `number` \| `boolean` \| `void` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `id` | `string` |

#### Returns

`undefined` \| [`Observable`](../modules/observable___init__.md#observable-1)<`T`\>

#### Defined in

[observable/observable_network.ts:26](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/observable/observable_network.ts#L26)

___

### notify\_change

▸ **notify_change**<`T`\>(`change`): `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `change` | [`ChangeMessage`](../modules/observable___init__.md#changemessage)<`T`\> |

#### Returns

`void`

#### Defined in

[observable/observable_network.ts:38](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/observable/observable_network.ts#L38)

___

### register

▸ **register**<`T`\>(`obs`): `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `obs` | [`Observable`](../modules/observable___init__.md#observable-1)<`T`\> |

#### Returns

`void`

#### Defined in

[observable/observable_network.ts:42](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/observable/observable_network.ts#L42)

___

### send\_change

▸ **send_change**<`T`\>(`change`): `void`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `change` | [`ChangeMessage`](../modules/observable___init__.md#changemessage)<`T`\> |

#### Returns

`void`

#### Defined in

[observable/observable_network.ts:30](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/observable/observable_network.ts#L30)
