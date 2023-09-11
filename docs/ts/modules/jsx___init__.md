[yggy](../README.md) / [Modules](../modules.md) / jsx/\_\_init\_\_

# Module: jsx/\_\_init\_\_

## Table of contents

### Classes

- [Binding](../classes/jsx___init__.Binding.md)

### Variables

- [svg](jsx___init__.md#svg)

### Functions

- [bind](jsx___init__.md#bind)
- [expr](jsx___init__.md#expr)
- [h](jsx___init__.md#h)
- [html](jsx___init__.md#html)
- [tmpl](jsx___init__.md#tmpl)

## Variables

### svg

• `Const` **svg**: `SVGProxy`

#### Defined in

[jsx/jsx.ts:67](https://github.com/Aldlevine/yggy/blob/a37fb28/src/jsx/jsx.ts#L67)

## Functions

### bind

▸ **bind**<`T`\>(`obs`, `...events`): [`Binding`](../classes/jsx___init__.Binding.md)<`T`\> \| `T`

Creates a binding definition.
Use in a JSX render call to bind
and Element property / event to
an [Observable](observable___init__.md#observable-1)

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `boolean` |

#### Parameters

| Name | Type | Description |
| :------ | :------ | :------ |
| `obs` | [`ObservableOr`](observable___init__.md#observableor)<`T`\> | the observable to bind (or a primitive) |
| `...events` | `string`[] | the events to bind |

#### Returns

[`Binding`](../classes/jsx___init__.Binding.md)<`T`\> \| `T`

a binding definition for JSX

**`Export`**

**`Example`**

```tsx
...
<input type="text" value={ bind(my_observable, "value", "input") } />
...
```

#### Defined in

[jsx/binding.ts:40](https://github.com/Aldlevine/yggy/blob/a37fb28/src/jsx/binding.ts#L40)

▸ **bind**<`T`\>(`obs`, `...events`): [`Binding`](../classes/jsx___init__.Binding.md)<`T`\> \| `T`

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

[`Binding`](../classes/jsx___init__.Binding.md)<`T`\> \| `T`

#### Defined in

[jsx/binding.ts:41](https://github.com/Aldlevine/yggy/blob/a37fb28/src/jsx/binding.ts#L41)

▸ **bind**<`T`\>(`obs`, `...events`): [`Binding`](../classes/jsx___init__.Binding.md)<`T`\> \| `T`

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

[`Binding`](../classes/jsx___init__.Binding.md)<`T`\> \| `T`

#### Defined in

[jsx/binding.ts:42](https://github.com/Aldlevine/yggy/blob/a37fb28/src/jsx/binding.ts#L42)

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

[jsx/helpers.ts:40](https://github.com/Aldlevine/yggy/blob/a37fb28/src/jsx/helpers.ts#L40)

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

[jsx/jsx.ts:75](https://github.com/Aldlevine/yggy/blob/a37fb28/src/jsx/jsx.ts#L75)

___

### html

▸ **html**(`html_str`): [`Observable`](observable___init__.md#observable-1)<`__NodeTree`\> \| `__NodeTree`

#### Parameters

| Name | Type |
| :------ | :------ |
| `html_str` | [`ObservableOr`](observable___init__.md#observableor)<`string`\> |

#### Returns

[`Observable`](observable___init__.md#observable-1)<`__NodeTree`\> \| `__NodeTree`

#### Defined in

[jsx/helpers.ts:61](https://github.com/Aldlevine/yggy/blob/a37fb28/src/jsx/helpers.ts#L61)

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

[jsx/helpers.ts:5](https://github.com/Aldlevine/yggy/blob/a37fb28/src/jsx/helpers.ts#L5)
