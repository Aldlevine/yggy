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

Function to get a default value from a dictionary if the key isn't present or is `undefined`

#### Type parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `T` | extends `Object` | extends { [key: string]: any } |
| `K` | extends `string` \| `number` \| `symbol` | extends keyof T |
| `R` | `Exclude`<`T`[`K`], `undefined`\> | Type of the return, excludes `undefined` from possible types of T[K] |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dict` | `T` | The dictionary to extract value from. |
| `key` | `K` | The key to look up in the dictionary. |
| `default_value` | `R` \| () => `R` | The default value to return if key isn't found or is `undefined`. |

#### Returns

`Exclude`<`T`[`K`], `undefined`\> \| `R`

- Returns the value from the dictionary or the default value.

#### Defined in

[utils/dicttools.ts:16](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/dicttools.ts#L16)

___

### set\_default

▸ **set_default**<`V`\>(`dict`, `key`, `default_value`): `V`

Function to set a default value in a dictionary if the key isn't present

#### Type parameters

| Name | Description |
| :------ | :------ |
| `V` | Type of the values in the dictionary. |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `dict` | `Object` | The dictionary to set the value in. |
| `key` | `Index_t` | The key in the dictionary. |
| `default_value` | `V` \| () => `V` | The default value to set if key isn't found. |

#### Returns

`V`

- Returns the value set in the dictionary.

#### Defined in

[utils/dicttools.ts:40](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/dicttools.ts#L40)
