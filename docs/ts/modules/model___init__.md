[yggy](../README.md) / [Modules](../modules.md) / model/\_\_init\_\_

# Module: model/\_\_init\_\_

## Table of contents

### Classes

- [Model](../classes/model___init__.Model.md)

### Type Aliases

- [ModelSchema](model___init__.md#modelschema)

### Functions

- [watch](model___init__.md#watch)

## Type Aliases

### ModelSchema

Ƭ **ModelSchema**: { `model_id`: `string`  } & { `[key: string]`: [`ObservableSchema`](observable___init__.md#observableschema)<`any`\> \| [`ModelSchema`](model___init__.md#modelschema);  }

#### Defined in

[model/schema.ts:3](https://github.com/Aldlevine/yggy/blob/a37fb28/src/model/schema.ts#L3)

## Functions

### watch

▸ **watch**<`T`\>(`args`, `fn`): [`Observable`](observable___init__.md#observable-1)<`T`\>

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `string` \| `number` \| `boolean` \| `void` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `args` | `any`[] |
| `fn` | () => `T` |

#### Returns

[`Observable`](observable___init__.md#observable-1)<`T`\>

#### Defined in

[model/model.ts:5](https://github.com/Aldlevine/yggy/blob/a37fb28/src/model/model.ts#L5)
