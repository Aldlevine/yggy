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

• **new Model**()

## Methods

### observables

▸ **observables**(): `Generator`<[`Observable`](observable___init__.Observable.md)<`any`\>, `any`, `unknown`\>

#### Returns

`Generator`<[`Observable`](observable___init__.Observable.md)<`any`\>, `any`, `unknown`\>

#### Defined in

[model/model.ts:58](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/model/model.ts#L58)

___

### from\_schema

▸ `Static` **from_schema**<`T`\>(`schema`): [`Model`](model___init__.Model.md) & `T`

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | `never` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `schema` | [`ModelSchema`](../modules/model___init__.md#modelschema) |

#### Returns

[`Model`](model___init__.Model.md) & `T`

#### Defined in

[model/model.ts:24](https://github.com/Aldlevine/yggy/blob/8e9bae7/yggy/model/model.ts#L24)
