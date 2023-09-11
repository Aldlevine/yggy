[yggy](../README.md) / [Modules](../modules.md) / [comm/\_\_init\_\_](../modules/comm___init__.md) / Comm

# Class: Comm

[comm/__init__](../modules/comm___init__.md).Comm

## Table of contents

### Constructors

- [constructor](comm___init__.Comm.md#constructor)

### Properties

- [#global\_receivers](comm___init__.Comm.md##global_receivers)
- [#id](comm___init__.Comm.md##id)
- [#open](comm___init__.Comm.md##open)
- [#receivers](comm___init__.Comm.md##receivers)
- [#senders](comm___init__.Comm.md##senders)

### Accessors

- [id](comm___init__.Comm.md#id)
- [open](comm___init__.Comm.md#open)

### Methods

- [#recv\_global](comm___init__.Comm.md##recv_global)
- [#recv\_named](comm___init__.Comm.md##recv_named)
- [#require\_open](comm___init__.Comm.md##require_open)
- [add\_sender](comm___init__.Comm.md#add_sender)
- [notify](comm___init__.Comm.md#notify)
- [recv](comm___init__.Comm.md#recv)
- [send](comm___init__.Comm.md#send)
- [stop](comm___init__.Comm.md#stop)
- [unrecv](comm___init__.Comm.md#unrecv)

## Constructors

### constructor

• **new Comm**()

## Properties

### #global\_receivers

• `Private` **#global\_receivers**: [`GlobalReceiverFn_t`](../modules/comm___init__.md#globalreceiverfn_t)[] = `[]`

#### Defined in

[comm/comm.ts:10](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L10)

___

### #id

• `Private` **#id**: `string`

#### Defined in

[comm/comm.ts:7](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L7)

___

### #open

• `Private` **#open**: `boolean` = `true`

#### Defined in

[comm/comm.ts:11](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L11)

___

### #receivers

• `Private` **#receivers**: `Object` = `{}`

#### Index signature

▪ [key: `string`]: [`ReceiverFn_t`](../modules/comm___init__.md#receiverfn_t)[]

#### Defined in

[comm/comm.ts:9](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L9)

___

### #senders

• `Private` **#senders**: [`GlobalReceiverFn_t`](../modules/comm___init__.md#globalreceiverfn_t)[] = `[]`

#### Defined in

[comm/comm.ts:8](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L8)

## Accessors

### id

• `get` **id**(): `string`

#### Returns

`string`

#### Defined in

[comm/comm.ts:13](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L13)

___

### open

• `get` **open**(): `boolean`

#### Returns

`boolean`

#### Defined in

[comm/comm.ts:16](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L16)

## Methods

### #recv\_global

▸ `Private` **#recv_global**(`fn`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | [`GlobalReceiverFn_t`](../modules/comm___init__.md#globalreceiverfn_t) |

#### Returns

`void`

#### Defined in

[comm/comm.ts:79](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L79)

___

### #recv\_named

▸ `Private` **#recv_named**(`arg0`, `arg1`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `arg0` | `string` |
| `arg1` | [`ReceiverFn_t`](../modules/comm___init__.md#receiverfn_t) |

#### Returns

`void`

#### Defined in

[comm/comm.ts:85](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L85)

___

### #require\_open

▸ `Private` **#require_open**(): `void`

#### Returns

`void`

#### Defined in

[comm/comm.ts:20](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L20)

___

### add\_sender

▸ **add_sender**(`sender`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `sender` | [`GlobalReceiverFn_t`](../modules/comm___init__.md#globalreceiverfn_t) |

#### Returns

`void`

#### Defined in

[comm/comm.ts:34](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L34)

___

### notify

▸ **notify**(`msg`, `data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `msg` | `string` |
| `data` | `any` |

#### Returns

`void`

#### Defined in

[comm/comm.ts:49](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L49)

___

### recv

▸ **recv**(`fn`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `fn` | [`GlobalReceiverFn_t`](../modules/comm___init__.md#globalreceiverfn_t) |

#### Returns

`void`

#### Defined in

[comm/comm.ts:60](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L60)

▸ **recv**(`msg`, `fn`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `msg` | `string` |
| `fn` | [`ReceiverFn_t`](../modules/comm___init__.md#receiverfn_t) |

#### Returns

`void`

#### Defined in

[comm/comm.ts:62](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L62)

___

### send

▸ **send**(`msg`, `data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `msg` | `string` |
| `data` | `any` |

#### Returns

`void`

#### Defined in

[comm/comm.ts:42](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L42)

___

### stop

▸ **stop**(): `void`

#### Returns

`void`

#### Defined in

[comm/comm.ts:26](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L26)

___

### unrecv

▸ **unrecv**(`msg`, `fn`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `msg` | `string` |
| `fn` | [`ReceiverFn_t`](../modules/comm___init__.md#receiverfn_t) |

#### Returns

`void`

#### Defined in

[comm/comm.ts:92](https://github.com/Aldlevine/yggy/blob/a37fb28/src/comm/comm.ts#L92)
