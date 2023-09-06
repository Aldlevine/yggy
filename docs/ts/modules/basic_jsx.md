[yggy](../README.md) / [Modules](../modules.md) / basic/jsx

# Module: basic/jsx

## Table of contents

### Classes

- [Binding](../classes/basic_jsx.Binding.md)

### Functions

- [bind](basic_jsx.md#bind)
- [expr](basic_jsx.md#expr)
- [h](basic_jsx.md#h)
- [html](basic_jsx.md#html)
- [tmpl](basic_jsx.md#tmpl)

## Functions

### bind

▸ **bind**<`T`\>(`obs`, `...events`): [`Binding`](../classes/basic_jsx.Binding.md)<`T`\> \| `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `boolean` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `obs` | [`ObservableOr`](observable___init__.md#observableor)<`T`\> |
| `...events` | `string`[] |

#### Returns

[`Binding`](../classes/basic_jsx.Binding.md)<`T`\> \| `T`

#### Defined in

[basic/jsx.ts:38](https://github.com/Aldlevine/yggy/blob/8bc8567/src/basic/jsx.ts#L38)

▸ **bind**<`T`\>(`obs`, `...events`): [`Binding`](../classes/basic_jsx.Binding.md)<`T`\> \| `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `string` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `obs` | [`ObservableOr`](observable___init__.md#observableor)<`T`\> |
| `...events` | `string`[] |

#### Returns

[`Binding`](../classes/basic_jsx.Binding.md)<`T`\> \| `T`

#### Defined in

[basic/jsx.ts:39](https://github.com/Aldlevine/yggy/blob/8bc8567/src/basic/jsx.ts#L39)

▸ **bind**<`T`\>(`obs`, `...events`): [`Binding`](../classes/basic_jsx.Binding.md)<`T`\> \| `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `number` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `obs` | [`ObservableOr`](observable___init__.md#observableor)<`T`\> |
| `...events` | `string`[] |

#### Returns

[`Binding`](../classes/basic_jsx.Binding.md)<`T`\> \| `T`

#### Defined in

[basic/jsx.ts:40](https://github.com/Aldlevine/yggy/blob/8bc8567/src/basic/jsx.ts#L40)

___

### expr

▸ **expr**(`strs`, `...args`): [`Observable`](observable___init__.md#observable-1)<`number`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `strs` | `TemplateStringsArray` |
| `...args` | [`ObservableOr`](observable___init__.md#observableor)<`number`\>[] |

#### Returns

[`Observable`](observable___init__.md#observable-1)<`number`\>

#### Defined in

[basic/jsx.ts:83](https://github.com/Aldlevine/yggy/blob/8bc8567/src/basic/jsx.ts#L83)

___

### h

▸ **h**(`name`, `attrs?`, `...children`): `Element`

#### Parameters

| Name | Type |
| :------ | :------ |
| `name` | `string` \| (...`args`: `any`[]) => `HTMLElement` |
| `attrs?` | `Object` |
| `...children` | `any` |

#### Returns

`Element`

#### Defined in

[basic/jsx.ts:207](https://github.com/Aldlevine/yggy/blob/8bc8567/src/basic/jsx.ts#L207)

___

### html

▸ **html**(`__html`): [`Observable`](observable___init__.md#observable-1)<`__NodeTree`\> \| `__NodeTree`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__html` | `string` \| [`Observable`](observable___init__.md#observable-1)<`string`\> |

#### Returns

[`Observable`](observable___init__.md#observable-1)<`__NodeTree`\> \| `__NodeTree`

#### Defined in

[basic/jsx.ts:197](https://github.com/Aldlevine/yggy/blob/8bc8567/src/basic/jsx.ts#L197)

___

### tmpl

▸ **tmpl**(`strings`, `...args`): [`Observable`](observable___init__.md#observable-1)<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `strings` | `TemplateStringsArray` |
| `...args` | `any`[] |

#### Returns

[`Observable`](observable___init__.md#observable-1)<`string`\>

#### Defined in

[basic/jsx.ts:48](https://github.com/Aldlevine/yggy/blob/8bc8567/src/basic/jsx.ts#L48)
