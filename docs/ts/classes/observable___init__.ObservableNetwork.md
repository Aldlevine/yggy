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

• **new ObservableNetwork**(`__comm`)

#### Parameters

| Name | Type |
| :------ | :------ |
| `__comm` | [`Comm`](comm___init__.Comm.md) |

#### Defined in

[observable/observable_network.ts:14](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable_network.ts#L14)

## Properties

### #comm

• `Private` **#comm**: [`Comm`](comm___init__.Comm.md)

#### Defined in

[observable/observable_network.ts:12](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable_network.ts#L12)

___

### #registry

• `Private` **#registry**: `Object`

#### Index signature

▪ [key: `string`]: [`Observable`](observable___init__.Observable.md)<`any`\>

#### Defined in

[observable/observable_network.ts:10](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable_network.ts#L10)

___

### #updating

• `Private` **#updating**: `Set`<`string`\>

#### Defined in

[observable/observable_network.ts:11](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable_network.ts#L11)

## Accessors

### comm

• `get` **comm**(): [`Comm`](comm___init__.Comm.md)

#### Returns

[`Comm`](comm___init__.Comm.md)

#### Defined in

[observable/observable_network.ts:22](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable_network.ts#L22)

## Methods

### #recv\_change

▸ `Private` **#recv_change**(`__change`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__change` | [`ChangeMessage`](../modules/observable___init__.md#changemessage)<`any`\> |

#### Returns

`void`

#### Defined in

[observable/observable_network.ts:50](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable_network.ts#L50)

___

### get

▸ **get**(`__id`): `undefined` \| [`Observable`](observable___init__.Observable.md)<`any`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `__id` | `string` \| `number` |

#### Returns

`undefined` \| [`Observable`](observable___init__.Observable.md)<`any`\>

#### Defined in

[observable/observable_network.ts:26](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable_network.ts#L26)

___

### notify\_change

▸ **notify_change**(`__change`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__change` | [`ChangeMessage`](../modules/observable___init__.md#changemessage)<`any`\> |

#### Returns

`void`

#### Defined in

[observable/observable_network.ts:41](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable_network.ts#L41)

___

### register

▸ **register**(`__obs`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__obs` | [`Observable`](observable___init__.Observable.md)<`any`\> |

#### Returns

`void`

#### Defined in

[observable/observable_network.ts:45](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable_network.ts#L45)

___

### send\_change

▸ **send_change**(`__change`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__change` | [`ChangeMessage`](../modules/observable___init__.md#changemessage)<`any`\> |

#### Returns

`void`

#### Defined in

[observable/observable_network.ts:33](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable_network.ts#L33)
