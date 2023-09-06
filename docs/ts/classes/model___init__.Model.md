[yggy](../README.md) / [Modules](../modules.md) / [model/\_\_init\_\_](../modules/model___init__.md) / Model

# Class: Model

[model/__init__](../modules/model___init__.md).Model

## Table of contents

### Constructors

- [constructor](model___init__.Model.md#constructor)

### Methods

- [observables](model___init__.Model.md#observables)
- [from\_schema](model___init__.Model.md#from_schema)

## Constructors

### constructor

• `Private` **new Model**()

#### Defined in

[model/model.ts:24](https://github.com/Aldlevine/yggy/blob/379e698/src/model/model.ts#L24)

## Methods

### observables

▸ **observables**(): `Generator`<[`Observable`](../modules/observable___init__.md#observable-1)<`any`\>, `any`, `unknown`\>

#### Returns

`Generator`<[`Observable`](../modules/observable___init__.md#observable-1)<`any`\>, `any`, `unknown`\>

#### Defined in

[model/model.ts:60](https://github.com/Aldlevine/yggy/blob/379e698/src/model/model.ts#L60)

___

### from\_schema

▸ `Static` **from_schema**<`T`\>(`schema`): `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends [`Model`](model___init__.Model.md) |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`ModelSchema`](../modules/model___init__.md#modelschema) |

#### Returns

`T`

#### Defined in

[model/model.ts:26](https://github.com/Aldlevine/yggy/blob/379e698/src/model/model.ts#L26)
