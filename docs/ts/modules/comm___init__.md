[yggy](../README.md) / [Modules](../modules.md) / comm/\_\_init\_\_

# Module: comm/\_\_init\_\_

## Table of contents

### Classes

- [Comm](../classes/comm___init__.Comm.md)
- [CommWS](../classes/comm___init__.CommWS.md)

### Type Aliases

- [GlobalReceiverFn\_t](comm___init__.md#globalreceiverfn_t)
- [Message](comm___init__.md#message)
- [ReceiverFn\_t](comm___init__.md#receiverfn_t)

### Functions

- [create\_message](comm___init__.md#create_message)

## Type Aliases

### GlobalReceiverFn\_t

Ƭ **GlobalReceiverFn\_t**: (`msg`: `string`, `data`: `any`) => `any`

#### Type declaration

▸ (`msg`, `data`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `msg` | `string` |
| `data` | `any` |

##### Returns

`any`

#### Defined in

[comm/comm.ts:1](https://github.com/Aldlevine/yggy/blob/8bc8567/src/comm/comm.ts#L1)

___

### Message

Ƭ **Message**: `Object`

#### Type declaration

| Name | Type |
| :------ | :------ |
| `message_id` | `string` |

#### Defined in

[comm/messages.ts:3](https://github.com/Aldlevine/yggy/blob/8bc8567/src/comm/messages.ts#L3)

___

### ReceiverFn\_t

Ƭ **ReceiverFn\_t**: (`data`: `any`) => `any`

#### Type declaration

▸ (`data`): `any`

##### Parameters

| Name | Type |
| :------ | :------ |
| `data` | `any` |

##### Returns

`any`

#### Defined in

[comm/comm.ts:2](https://github.com/Aldlevine/yggy/blob/8bc8567/src/comm/comm.ts#L2)

## Functions

### create\_message

▸ **create_message**<`T`\>(`kwds`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`Message`](comm___init__.md#message) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `kwds` | `Omit`<`T`, ``"message_id"``\> |

#### Returns

`T`

#### Defined in

[comm/messages.ts:7](https://github.com/Aldlevine/yggy/blob/8bc8567/src/comm/messages.ts#L7)
