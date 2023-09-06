[yggy](../README.md) / [Modules](../modules.md) / [utils/\_\_init\_\_](../modules/utils___init__.md) / [weakref](../modules/utils___init__.weakref.md) / IterableWeakMap

# Class: IterableWeakMap<K, V\>

[utils/__init__](../modules/utils___init__.md).[weakref](../modules/utils___init__.weakref.md).IterableWeakMap

## Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `object` |
| `V` | `V` |

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

#### Type parameters

| Name | Type |
| :------ | :------ |
| `K` | extends `object` |
| `V` | `V` |

#### Parameters

| Name | Type | Default value |
| :------ | :------ | :------ |
| `iterable` | [`K`, `V`][] | `[]` |

#### Defined in

[utils/weakref.ts:10](https://github.com/Aldlevine/yggy/blob/379e698/src/utils/weakref.ts#L10)

## Properties

### #finalization\_group

• `Private` **#finalization\_group**: `FinalizationRegistry`<{ `ref`: `WeakRef`<`K`\> ; `set`: `Set`<`WeakRef`<`K`\>\>  }\>

#### Defined in

[utils/weakref.ts:4](https://github.com/Aldlevine/yggy/blob/379e698/src/utils/weakref.ts#L4)

___

### #ref\_set

• `Private` **#ref\_set**: `Set`<`WeakRef`<`K`\>\>

#### Defined in

[utils/weakref.ts:3](https://github.com/Aldlevine/yggy/blob/379e698/src/utils/weakref.ts#L3)

___

### #weak\_map

• `Private` **#weak\_map**: `WeakMap`<`K`, { `ref`: `WeakRef`<`K`\> ; `value`: `V`  }\>

#### Defined in

[utils/weakref.ts:2](https://github.com/Aldlevine/yggy/blob/379e698/src/utils/weakref.ts#L2)

## Methods

### [iterator]

▸ **[iterator]**(): `Generator`<[`K`, `V`], `any`, `unknown`\>

#### Returns

`Generator`<[`K`, `V`], `any`, `unknown`\>

#### Defined in

[utils/weakref.ts:43](https://github.com/Aldlevine/yggy/blob/379e698/src/utils/weakref.ts#L43)

___

### delete

▸ **delete**(`key`): `boolean`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `K` |

#### Returns

`boolean`

#### Defined in

[utils/weakref.ts:31](https://github.com/Aldlevine/yggy/blob/379e698/src/utils/weakref.ts#L31)

___

### entries

▸ **entries**(): `Iterator`<[`K`, `V`], `any`, `undefined`\>

#### Returns

`Iterator`<[`K`, `V`], `any`, `undefined`\>

#### Defined in

[utils/weakref.ts:52](https://github.com/Aldlevine/yggy/blob/379e698/src/utils/weakref.ts#L52)

___

### get

▸ **get**(`key`): `void` \| `V`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `K` |

#### Returns

`void` \| `V`

#### Defined in

[utils/weakref.ts:26](https://github.com/Aldlevine/yggy/blob/379e698/src/utils/weakref.ts#L26)

___

### keys

▸ **keys**(): `Generator`<`K`, `any`, `unknown`\>

#### Returns

`Generator`<`K`, `any`, `unknown`\>

#### Defined in

[utils/weakref.ts:56](https://github.com/Aldlevine/yggy/blob/379e698/src/utils/weakref.ts#L56)

___

### set

▸ **set**(`key`, `value`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `key` | `K` |
| `value` | `V` |

#### Returns

`void`

#### Defined in

[utils/weakref.ts:16](https://github.com/Aldlevine/yggy/blob/379e698/src/utils/weakref.ts#L16)

___

### values

▸ **values**(): `Generator`<`V`, `any`, `unknown`\>

#### Returns

`Generator`<`V`, `any`, `unknown`\>

#### Defined in

[utils/weakref.ts:62](https://github.com/Aldlevine/yggy/blob/379e698/src/utils/weakref.ts#L62)

___

### #cleanup

▸ `Static` `Private` **#cleanup**(`«destructured»`): `void`

#### Parameters

| Name | Type |
| :------ | :------ |
| `«destructured»` | `Object` |
| › `ref` | `WeakRef`<`any`\> |
| › `set` | `Set`<`WeakRef`<`any`\>\> |

#### Returns

`void`

#### Defined in

[utils/weakref.ts:6](https://github.com/Aldlevine/yggy/blob/379e698/src/utils/weakref.ts#L6)
