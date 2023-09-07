[yggy](../README.md) / [Modules](../modules.md) / [utils/\_\_init\_\_](../modules/utils___init__.md) / [weakref](../modules/utils___init__.weakref.md) / IterableWeakMap

# Class: IterableWeakMap<K, V\>

[utils/__init__](../modules/utils___init__.md).[weakref](../modules/utils___init__.weakref.md).IterableWeakMap

An Iterable WeakMap.

## Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `K` | extends `object` | The keys' type, must be an object. |
| `V` | `V` | The values' type. |

## Table of contents

### Constructors

- [constructor](utils___init__.weakref.IterableWeakMap.md#constructor)

### Properties

- [#finalization\_group](utils___init__.weakref.IterableWeakMap.md##finalization_group)
- [#ref\_set](utils___init__.weakref.IterableWeakMap.md##ref_set)
- [#weak\_map](utils___init__.weakref.IterableWeakMap.md##weak_map)

### Methods

- [[iterator]](utils___init__.weakref.IterableWeakMap.md#[iterator])
- [delete](utils___init__.weakref.IterableWeakMap.md#delete)
- [entries](utils___init__.weakref.IterableWeakMap.md#entries)
- [get](utils___init__.weakref.IterableWeakMap.md#get)
- [keys](utils___init__.weakref.IterableWeakMap.md#keys)
- [set](utils___init__.weakref.IterableWeakMap.md#set)
- [values](utils___init__.weakref.IterableWeakMap.md#values)
- [#cleanup](utils___init__.weakref.IterableWeakMap.md##cleanup)

## Constructors

### constructor

• **new IterableWeakMap**<`K`, `V`\>(`iterable?`)

Constructs an IterableWeakMap instance.

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `object` |
| `V` | `V` |

#### Parameters

| Name | Type | Default value | Description |
| :------ | :------ | :------ | :------ |
| `iterable` | [`K`, `V`][] | `[]` | An array of key-value pairs to initialize the map. |

#### Defined in

[utils/weakref.ts:22](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/weakref.ts#L22)

## Properties

### #finalization\_group

• `Private` **#finalization\_group**: `FinalizationRegistry`<{ `ref`: `WeakRef`<`K`\> ; `set`: `Set`<`WeakRef`<`K`\>\>  }\>

#### Defined in

[utils/weakref.ts:9](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/weakref.ts#L9)

___

### #ref\_set

• `Private` **#ref\_set**: `Set`<`WeakRef`<`K`\>\>

#### Defined in

[utils/weakref.ts:8](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/weakref.ts#L8)

___

### #weak\_map

• `Private` **#weak\_map**: `WeakMap`<`K`, { `ref`: `WeakRef`<`K`\> ; `value`: `V`  }\>

#### Defined in

[utils/weakref.ts:7](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/weakref.ts#L7)

## Methods

### [iterator]

▸ **[iterator]**(): `Generator`<[`K`, `V`], `any`, `unknown`\>

Provides a generator for iterating over keys and values.

#### Returns

`Generator`<[`K`, `V`], `any`, `unknown`\>

A Generator yielding key-value pairs.

#### Defined in

[utils/weakref.ts:74](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/weakref.ts#L74)

___

### delete

▸ **delete**(`key`): `boolean`

Deletes a key-value pair by key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `K` | The key to delete. |

#### Returns

`boolean`

True if deletion was successful, false otherwise.

#### Defined in

[utils/weakref.ts:58](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/weakref.ts#L58)

___

### entries

▸ **entries**(): `Iterator`<[`K`, `V`], `any`, `undefined`\>

Provides an iterator for the entries of the map.

#### Returns

`Iterator`<[`K`, `V`], `any`, `undefined`\>

An Iterator for the entries.

#### Defined in

[utils/weakref.ts:87](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/weakref.ts#L87)

___

### get

▸ **get**(`key`): `void` \| `V`

Retrieves a value by its key.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `K` | The key to get. |

#### Returns

`void` \| `V`

The value or undefined if not found.

#### Defined in

[utils/weakref.ts:48](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/weakref.ts#L48)

___

### keys

▸ **keys**(): `Generator`<`K`, `any`, `unknown`\>

Provides a generator that yields keys.

#### Returns

`Generator`<`K`, `any`, `unknown`\>

A Generator of keys.

#### Defined in

[utils/weakref.ts:95](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/weakref.ts#L95)

___

### set

▸ **set**(`key`, `value`): `void`

Sets a key-value pair in the weak map.

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `key` | `K` | The key to add |
| `value` | `V` | The value to add |

#### Returns

`void`

#### Defined in

[utils/weakref.ts:33](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/weakref.ts#L33)

___

### values

▸ **values**(): `Generator`<`V`, `any`, `unknown`\>

Provides a generator that yields values.

#### Returns

`Generator`<`V`, `any`, `unknown`\>

A Generator of values.

#### Defined in

[utils/weakref.ts:105](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/weakref.ts#L105)

___

### #cleanup

▸ `Static` `Private` **#cleanup**(`«destructured»`): `void`

Cleans up references from set.

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `ref` | `WeakRef`<`any`\> |
| › `set` | `Set`<`WeakRef`<`any`\>\> |

#### Returns

`void`

#### Defined in

[utils/weakref.ts:14](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/weakref.ts#L14)
