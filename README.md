# jackson-js

[![npm downloads](https://img.shields.io/npm/dm/jackson-js.svg)](https://www.npmjs.com/package/jackson-js)
[![jackson-js version](https://img.shields.io/npm/v/jackson-js.svg)](https://www.npmjs.com/package/jackson-js)
[![Travis](https://img.shields.io/travis/pichillilorenzo/jackson-js.svg?branch=master)](https://travis-ci.org/pichillilorenzo/jackson-js)
[![Coverage Status](https://coveralls.io/repos/github/pichillilorenzo/jackson-js/badge.svg?branch=master)](https://coveralls.io/github/pichillilorenzo/jackson-js?branch=master)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg)](/LICENSE)
[![Donate to this project using Paypal](https://img.shields.io/badge/paypal-donate-yellow.svg)](https://www.paypal.me/LorenzoPichilli)
[![Donate to this project using Patreon](https://img.shields.io/badge/patreon-donate-yellow.svg)](https://www.patreon.com/bePatron?u=9269604)

As the name implies, `jackson-js` is heavily inspired by the famous Java [FasterXML/jackson library](https://github.com/FasterXML/jackson).

It can be used on both **client** (browser) and **server** (Node.js) side.

Why this library? What's the difference between using this library instead of `JSON.parse` and `JSON.stringify`?

With `jackson-js` , you can customize your JavaScript object serializion/deserializion using decorators such as `@JsonProperty()`, `@JsonFormat()`, `@JsonIgnore()`, etc. However, this library uses `JSON.parse` and `JSON.stringify` under the hood.

Furthermore: 
- it not only deserialize JSON text into a JavaScript object, it also converts it into an instance of its class (instead, with `JSON.parse` you will get just a simple JavaScript object of type `Object`);
- it supports more advanced Object concepts such as **polymorphism** and **Object identity**;
- it supports **cyclic object** serialization/deserialization;
- it supports serialization/deserialization of other native JavaScript types: `Map`, `Set`, `BigInt`, Typed Arrays (such as `Int8Array`);

This library implements almost all of the Java jackson annotations.

## Installation
```
npm install --save jackson-js
```

## API



## Important note

The most important decorators are:
- `@JsonProperty()`: Each class property (or its getter/setter) must be decorated with this decorator, otherwise deserialization and serialization will not work properly! That's because, for example, given a JavaScript class, there isn't any way or API (such as [Reflection API for Java](https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/package-summary.html)) to get for sure all the class properties;
- `@JsonClassType()`: This decorator, instead, is used to define the type of a class property or method parameter. This information is used during serialization and, more important, during deserialization to know about **the type of a property/parameter**. This is necessary because JavaScript isn't a strong typed programming language, so, for example, during deserialization, without the usage of this decorator, there isn't any way to know the specific type of a class property, such as a `Date` or a custom Class type.

Here is a quick example about this two decorators:
```typescript
class Book {
  @JsonProperty() @JsonClassType({type: () => [String]})
  name: string;

  @JsonProperty() @JsonClassType({type: () => [String]})
  category: string;
}

class Writer {
  @JsonProperty() @JsonClassType({type: () => [Number]})
  id: number;
  @JsonProperty() @JsonClassType({type: () => [String]})
  name: string;

  @JsonProperty() @JsonClassType({type: () => [Array, [Book]]})
  books: Book[] = [];
}
```

## Tutorials
- [Jackson-js: JavaScript decorators to serialize/deserialize objects into JSON and vice versa (Part 1)]()
