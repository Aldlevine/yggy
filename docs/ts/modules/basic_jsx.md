[yggy](../README.md) / [Modules](../modules.md) / basic/jsx

# Module: basic/jsx

## Table of contents

### Classes

- [Binding](../classes/basic_jsx.Binding.md)

### Type Aliases

- [PropertiesOf](basic_jsx.md#propertiesof)
- [ValuesOf](basic_jsx.md#valuesof)

### Functions

- [bind](basic_jsx.md#bind)
- [h](basic_jsx.md#h)
- [html](basic_jsx.md#html)
- [tmpl](basic_jsx.md#tmpl)

## Type Aliases

### PropertiesOf

Ƭ **PropertiesOf**<`T`\>: { [P in keyof Omit<T, keyof Model \| keyof Observable<any\>\>]: T[P] extends Observable<infer U\> ? T[P] \| U : T[P] extends Observable<infer U\> \| undefined ? T[P] \| U \| undefined : T[P] }

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[basic/jsx.ts:7](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/basic/jsx.ts#L7)

___

### ValuesOf

Ƭ **ValuesOf**<`T`\>: { [P in keyof T]: T[P] extends Observable<infer U\> \| infer U ? U : T[P] }

#### Type parameters

| Name |
| :------ |
| `T` |

#### Defined in

[basic/jsx.ts:16](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/basic/jsx.ts#L16)

## Functions

### bind

▸ **bind**<`T`\>(`obs`, `...events`): [`Binding`](../classes/basic_jsx.Binding.md) \| `T`

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `obs` | `T` \| [`Observable`](../classes/observable___init__.Observable.md)<`T`\> |
| `...events` | `string`[] |

#### Returns

[`Binding`](../classes/basic_jsx.Binding.md) \| `T`

#### Defined in

[basic/jsx.ts:44](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/basic/jsx.ts#L44)

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

[basic/jsx.ts:169](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/basic/jsx.ts#L169)

___

### html

▸ **html**(`__html`): [`Observable`](../classes/observable___init__.Observable.md)<`__NodeTree`\> \| `__NodeTree`

#### Parameters

| Name | Type |
| :------ | :------ |
| `__html` | `string` \| [`Observable`](../classes/observable___init__.Observable.md)<`string`\> |

#### Returns

[`Observable`](../classes/observable___init__.Observable.md)<`__NodeTree`\> \| `__NodeTree`

#### Defined in

[basic/jsx.ts:161](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/basic/jsx.ts#L161)

___

### tmpl

▸ **tmpl**(`strings`, `...args`): [`Observable`](../classes/observable___init__.Observable.md)<`string`\>

#### Parameters

| Name | Type |
| :------ | :------ |
| `strings` | `TemplateStringsArray` |
| `...args` | `any`[] |

#### Returns

[`Observable`](../classes/observable___init__.Observable.md)<`string`\>

#### Defined in

[basic/jsx.ts:51](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/basic/jsx.ts#L51)
