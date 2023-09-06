[yggy](../README.md) / [Modules](../modules.md) / [utils/\_\_init\_\_](utils___init__.md) / dicttools

# Namespace: dicttools

[utils/__init__](utils___init__.md).dicttools

## Table of contents

### Functions

- [get\_default](utils___init__.dicttools.md#get_default)
- [set\_default](utils___init__.dicttools.md#set_default)

## Functions

### get\_default

▸ **get_default**<`T`, `K`, `R`\>(`dict`, `key`, `default_value`): `Exclude`<`T`[`K`], `undefined`\> \| `R`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `Object` |
| `K` | extends `string` \| `number` \| `symbol` |
| `R` | `Exclude`<`T`[`K`], `undefined`\> |

#### Parameters

| Name | Type |
| :------ | :------ |
| `dict` | `T` |
| `key` | `K` |
| `default_value` | `R` \| () => `R` |

#### Returns

`Exclude`<`T`[`K`], `undefined`\> \| `R`

#### Defined in

[utils/dicttools.ts:3](https://github.com/Aldlevine/yggy/blob/8bc8567/src/utils/dicttools.ts#L3)

___

### set\_default

▸ **set_default**<`V`\>(`dict`, `key`, `default_value`): `V`

#### Type parameters

| Name |
| :------ |
| `V` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `dict` | `Object` |
| `key` | `Index_t` |
| `default_value` | `V` \| () => `V` |

#### Returns

`V`

#### Defined in

[utils/dicttools.ts:19](https://github.com/Aldlevine/yggy/blob/8bc8567/src/utils/dicttools.ts#L19)
