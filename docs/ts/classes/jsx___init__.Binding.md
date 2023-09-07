[yggy](../README.md) / [Modules](../modules.md) / [jsx/\_\_init\_\_](../modules/jsx___init__.md) / Binding

# Class: Binding<T\>

[jsx/__init__](../modules/jsx___init__.md).Binding

A definition object that tells [h](../modules/jsx___init__.md#h) to
create the specified binding at render time.

**`Export`**

## Type parameters

| Name |
| :------ |
| `T` |

## Table of contents

### Constructors

- [constructor](jsx___init__.Binding.md#constructor)

### Properties

- [events](jsx___init__.Binding.md#events)
- [obs](jsx___init__.Binding.md#obs)

## Constructors

### constructor

• **new Binding**<`T`\>(`obs`, `...events`)

#### Type parameters

| Name |
| :------ |
| `T` |

#### Parameters

| Name | Type |
| :------ | :------ |
| `obs` | [`Observable`](../modules/observable___init__.md#observable-1)<`T`\> |
| `...events` | `string`[] |

#### Defined in

[jsx/binding.ts:15](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/jsx/binding.ts#L15)

## Properties

### events

• **events**: `string`[]

#### Defined in

[jsx/binding.ts:13](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/jsx/binding.ts#L13)

___

### obs

• **obs**: [`Observable`](../modules/observable___init__.md#observable-1)<`T`\>

#### Defined in

[jsx/binding.ts:12](https://github.com/Aldlevine/yggy/blob/ad84d0f/src/jsx/binding.ts#L12)
