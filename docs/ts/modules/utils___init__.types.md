[yggy](../README.md) / [Modules](../modules.md) / [utils/\_\_init\_\_](utils___init__.md) / types

# Namespace: types

[utils/__init__](utils___init__.md).types

## Table of contents

### Type Aliases

- [Equals](utils___init__.types.md#equals)
- [WritableKeys](utils___init__.types.md#writablekeys)

## Type Aliases

### Equals

Ƭ **Equals**<`A1`, `A2`\>: <A\>() => `A` extends `A2` ? ``1`` : ``0`` extends <A\>() => `A` extends `A1` ? ``1`` : ``0`` ? <A\>() => `A` extends `A1` ? ``1`` : ``0`` extends <A\>() => `A` extends `A2` ? ``1`` : ``0`` ? ``1`` : ``0`` : ``0``

Resolves to 1 if A1 == A2 and 0 otherwise.

**`Export`**

#### Type parameters

| Name | Type |
| :------ | :------ |
| `A1` | extends `any` |
| `A2` | extends `any` |

#### Defined in

[utils/types.ts:9](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/types.ts#L9)

___

### WritableKeys

Ƭ **WritableKeys**<`T`\>: { [K in keyof T]-?: Object[Equals<{ -readonly [Q in K]: T[K] }, { [Q in K]: T[K] }\>] }[keyof `T`]

Resolves a union of writable properties of T

**`Export`**

#### Type parameters

| Name | Type |
| :------ | :------ |
| `T` | extends `object` |

#### Defined in

[utils/types.ts:25](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/utils/types.ts#L25)
