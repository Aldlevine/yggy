[yggy](../README.md) / [Modules](../modules.md) / observable/\_\_init\_\_

# Module: observable/\_\_init\_\_

## Table of contents

### Classes

- [Observable](../classes/observable___init__.Observable.md)
- [ObservableNetwork](../classes/observable___init__.ObservableNetwork.md)

### Type Aliases

- [ChangeMessage](observable___init__.md#changemessage)
- [ClientChangeMessage](observable___init__.md#clientchangemessage)
- [ObservableSchema](observable___init__.md#observableschema)
- [RegisterMessage](observable___init__.md#registermessage)

### Variables

- [OBSERVABLE\_CHANGE\_MSG](observable___init__.md#observable_change_msg)
- [OBSERVABLE\_CLIENT\_CHANGE\_MSG](observable___init__.md#observable_client_change_msg)
- [OBSERVABLE\_REGISTER\_MSG](observable___init__.md#observable_register_msg)

### Functions

- [get](observable___init__.md#get)

## Type Aliases

### ChangeMessage

Ƭ **ChangeMessage**<`T`\>: [`Message`](comm___init__.md#message) & { `data_id`: `string` ; `new_value`: `T`  }

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[observable/messages.ts:7](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/messages.ts#L7)

___

### ClientChangeMessage

Ƭ **ClientChangeMessage**<`T`\>: [`ChangeMessage`](observable___init__.md#changemessage)<`T`\> & {}

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[observable/messages.ts:12](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/messages.ts#L12)

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

[observable/schema.ts:1](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/schema.ts#L1)

___

### RegisterMessage

Ƭ **RegisterMessage**<`T`\>: [`Message`](comm___init__.md#message) & { `data_id`: `string` ; `value`: `T`  }

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[observable/messages.ts:14](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/messages.ts#L14)

## Variables

### OBSERVABLE\_CHANGE\_MSG

• `Const` **OBSERVABLE\_CHANGE\_MSG**: ``"observable.change"``

#### Defined in

[observable/messages.ts:3](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/messages.ts#L3)

___

### OBSERVABLE\_CLIENT\_CHANGE\_MSG

• `Const` **OBSERVABLE\_CLIENT\_CHANGE\_MSG**: ``"observable.client_change"``

#### Defined in

[observable/messages.ts:4](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/messages.ts#L4)

___

### OBSERVABLE\_REGISTER\_MSG

• `Const` **OBSERVABLE\_REGISTER\_MSG**: ``"observable.register"``

#### Defined in

[observable/messages.ts:5](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/messages.ts#L5)

## Functions

### get

▸ **get**<`T`\>(`obs`): `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `obs` | `T` \| [`Observable`](../classes/observable___init__.Observable.md)<`T`\> |

#### Returns

`T`

#### Defined in

[observable/observable.ts:11](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/observable/observable.ts#L11)
