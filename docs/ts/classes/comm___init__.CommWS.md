[yggy](../README.md) / [Modules](../modules.md) / [comm/\_\_init\_\_](../modules/comm___init__.md) / CommWS

# Class: CommWS

[comm/__init__](../modules/comm___init__.md).CommWS

## Table of contents

### Constructors

- [constructor](comm___init__.CommWS.md#constructor)

### Properties

- [#comm](comm___init__.CommWS.md##comm)
- [#host](comm___init__.CommWS.md##host)
- [#open](comm___init__.CommWS.md##open)
- [#port](comm___init__.CommWS.md##port)
- [#shutdown](comm___init__.CommWS.md##shutdown)
- [#websocket](comm___init__.CommWS.md##websocket)

### Accessors

- [comm](comm___init__.CommWS.md#comm)
- [host](comm___init__.CommWS.md#host)
- [port](comm___init__.CommWS.md#port)

### Methods

- [#create\_websocket](comm___init__.CommWS.md##create_websocket)
- [#onclose](comm___init__.CommWS.md##onclose)
- [#onerror](comm___init__.CommWS.md##onerror)
- [#onmessage](comm___init__.CommWS.md##onmessage)
- [#onopen](comm___init__.CommWS.md##onopen)
- [#onsend](comm___init__.CommWS.md##onsend)
- [close](comm___init__.CommWS.md#close)

## Constructors

### constructor

• **new CommWS**(`comm`, `host?`, `port?`)

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `comm` | [`Comm`](comm___init__.Comm.md) | `undefined` |
| `host` | `string` | `"localhost"` |
| `port` | `number` | `5678` |

#### Defined in

[comm/comm_ws.ts:11](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L11)

## Properties

### #comm

• `Private` **#comm**: [`Comm`](comm___init__.Comm.md)

#### Defined in

[comm/comm_ws.ts:4](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L4)

___

### #host

• `Private` **#host**: `string`

#### Defined in

[comm/comm_ws.ts:5](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L5)

___

### #open

• `Private` **#open**: `boolean`

#### Defined in

[comm/comm_ws.ts:8](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L8)

___

### #port

• `Private` **#port**: `number`

#### Defined in

[comm/comm_ws.ts:6](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L6)

___

### #shutdown

• `Private` **#shutdown**: `boolean` = `false`

#### Defined in

[comm/comm_ws.ts:9](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L9)

___

### #websocket

• `Private` **#websocket**: `WebSocket`

#### Defined in

[comm/comm_ws.ts:7](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L7)

## Accessors

### comm

• `get` **comm**(): [`Comm`](comm___init__.Comm.md)

#### Returns

[`Comm`](comm___init__.Comm.md)

#### Defined in

[comm/comm_ws.ts:21](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L21)

___

### host

• `get` **host**(): `string`

#### Returns

`string`

#### Defined in

[comm/comm_ws.ts:24](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L24)

___

### port

• `get` **port**(): `number`

#### Returns

`number`

#### Defined in

[comm/comm_ws.ts:27](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L27)

## Methods

### #create\_websocket

▸ `Private` **#create_websocket**(): `void`

#### Returns

`void`

#### Defined in

[comm/comm_ws.ts:36](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L36)

___

### #onclose

▸ `Private` **#onclose**(`ev`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ev` | `CloseEvent` |

#### Returns

`void`

#### Defined in

[comm/comm_ws.ts:73](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L73)

___

### #onerror

▸ `Private` **#onerror**(`ev`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ev` | `Event` |

#### Returns

`void`

#### Defined in

[comm/comm_ws.ts:69](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L69)

___

### #onmessage

▸ `Private` **#onmessage**(`«destructured»`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `MessageEvent`<`any`\> |

#### Returns

`void`

#### Defined in

[comm/comm_ws.ts:60](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L60)

___

### #onopen

▸ `Private` **#onopen**(`ev`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `ev` | `Event` |

#### Returns

`void`

#### Defined in

[comm/comm_ws.ts:65](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L65)

___

### #onsend

▸ `Private` **#onsend**(`msg`, `data`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `msg` | `string` |
| `data` | `any` |

#### Returns

`void`

#### Defined in

[comm/comm_ws.ts:56](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L56)

___

### close

▸ **close**(): `void`

#### Returns

`void`

#### Defined in

[comm/comm_ws.ts:31](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/comm/comm_ws.ts#L31)
