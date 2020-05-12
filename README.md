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

## Why this library? What's the difference between using this library instead of `JSON.parse` and `JSON.stringify`?

For simple cases, you don't need this library of course, you can just use `JSON.parse` and `JSON.stringify` to serialize/deserialize JSON.

With `jackson-js` , you can easily manipulate your JavaScript objects/values serialization/deserialization using decorators such as `@JsonProperty()`, `@JsonFormat()`, `@JsonIgnore()`, and more. However, this library uses `JSON.parse` and `JSON.stringify` under the hood.

Furthermore: 
- it not only deserialize JSON text into a JavaScript object, it also converts it into an **instance of the class** specified in the `context` option (similar packages are: [class-transformer](https://github.com/typestack/class-transformer) and [TypedJSON](https://github.com/JohnWeisz/TypedJSON)); instead, with `JSON.parse` you will get just a simple plain (literal) JavaScript object (just `Object` type);
- it supports more advanced Object concepts such as **polymorphism** and **Object identity**;
- it supports **cyclic object** serialization/deserialization;
- it supports serialization/deserialization of other native JavaScript types: `Map`, `Set`, `BigInt`, Typed Arrays (such as `Int8Array`);

This library can be useful in more complex cases, for example when you want to:
- manipulate JSON in depth;
- restore a JavaScript type (a similar package is [class-transformer](https://github.com/typestack/class-transformer)); 
- preserve type information (using polymorphic type handling decorators: `@JsonTypeInfo`, `@JsonSubTypes`, and `@JsonTypeName`. A similar package is [TypedJSON](https://github.com/JohnWeisz/TypedJSON));
- hide some properties for certain HTTP endpoints or some other external service;
- have different JSON response for some external application or manage different JSON data coming from other application (for example you need to communicate with a Spring Boot application that uses different JSON Schema for the same model or with other applications made with Python, PHP, etc...);
- manage cyclic references;
- manage other JavaScript native types such as Maps and Sets;
- etc.

Most of the use cases of the Java [FasterXML/jackson](https://github.com/FasterXML/jackson) annotations are similar or equal.

## Installation
```
npm install --save jackson-js
```

## API

API docs can be found [here](https://pichillilorenzo.github.io/jackson-js).

The main classes that `jackson-js` offers to serialize and deserialize JavaScript objects are: `ObjectMapper`, `JsonStringifier` and `JsonParser`.

### ObjectMapper

`ObjectMapper` provides functionality for both reading and writing JSON and apply `jackson-js` **decorators**. It will use instances of `JsonParser` and `JsonStringifier` for implementing actual reading/writing of JSON. It has two methods:
- `stringify(obj: T, context?: JsonStringifierContext): string`: a method for serializing a JavaScript object or a value to a JSON string with **decorators** applied;
- `parse(text: string, context?: JsonParserContext): T`: a method for deserializing a JSON string into a JavaScript object/value (of type `T`, based on the context given) with **decorators** applied.

### JsonParser

`JsonParser` provides functionality for writing JSON. The main methods are:
- `parse(text: string, context?: JsonParserContext): T` : a method for deserializing a JSON string into a JavaScript object/value (of type `T`, based on the context given) with **decorators** applied;
- `transform(value: any, context?: JsonParserContext): any` : a method for applying JSON decorators to a JavaScript object/value parsed. It returns a JavaScript object/value with JSON decorators applied.

### JsonStringifier

`JsonStringifier` provides functionality for reading JSON. The main methods are:
- `stringify(obj: T, context?: JsonStringifierContext): string`: a method for serializing a JavaScript object or a value to a JSON string with **decorators** applied;
- `transform(value: any, context?: JsonStringifierContext): any`: a method for applying JSON decorators to a JavaScript object/value. It returns a JavaScript object/value with JSON decorators applied and ready to be JSON serialized.

### Decorators

Decorators available:
- [JsonAlias](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonalias) (decorator options: [JsonAliasOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonaliasoptions.html))
- [JsonAnyGetter](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonanygetter) (decorator options: [JsonAnyGetterOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonanygetteroptions.html))
- [JsonAnySetter](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonanysetter) (decorator options: [JsonAnySetterOptions](https://pichillilorenzo.github.io/jackson-js/latest/modules/types.html#jsonanysetteroptions))
- [JsonAppend](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonappend) (decorator options: [JsonAppendOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonappendoptions.html))
- [JsonBackReference](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonbackreference) (decorator options: [JsonBackReferenceOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonbackreferenceoptions.html))
- [JsonClassType](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonclasstype) (decorator options: [JsonClassTypeOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonclasstypeoptions.html))
- [JsonCreator](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsoncreator) (decorator options: [JsonCreatorOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsoncreatoroptions.html))
- [JsonDeserialize](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsondeserialize) (decorator options: [JsonDeserializeOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsondeserializeoptions.html))
- [JsonFilter](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonfilter) (decorator options: [JsonFilterOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonfilteroptions.html))
- [JsonFormat](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonformat) (decorator options: [JsonFormatOptions](https://pichillilorenzo.github.io/jackson-js/latest/modules/types.html#jsonformatoptions))
- [JsonGetter](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsongetter) (decorator options: [JsonGetterOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsongetteroptions.html))
- [JsonIdentityInfo](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonidentityinfo) (decorator options: [JsonIdentityInfoOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonidentityinfooptions.html))
- [JsonIdentityReference](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonidentityreference) (decorator options: [JsonIdentityReferenceOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonidentityreferenceoptions.html))
- [JsonIgnore](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonignore) (decorator options: [JsonIgnoreOptions](https://pichillilorenzo.github.io/jackson-js/latest/modules/types.html#jsonignoreoptions))
- [JsonIgnoreProperties](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonignoreproperties) (decorator options: [JsonIgnorePropertiesOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonignorepropertiesoptions.html))
- [JsonIgnoreType](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonignoretype) (decorator options: [JsonIgnoreTypeOptions](https://pichillilorenzo.github.io/jackson-js/latest/modules/types.html#jsonignoretypeoptions))
- [JsonInclude](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsoninclude) (decorator options: [JsonIncludeOptions](https://pichillilorenzo.github.io/jackson-js/latest/modules/types.html#jsonincludeoptions))
- [JsonInject](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsoninject) (decorator options: [JsonInjectOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsoninjectoptions.html))
- [JsonManagedReference](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonmanagedreference) (decorator options: [JsonManagedReferenceOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonmanagedreferenceoptions.html))
- [JsonNaming](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonnaming) (decorator options: [JsonNamingOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonnamingoptions.html))
- [JsonProperty](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonproperty) (decorator options: [JsonPropertyOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonpropertyoptions.html))
- [JsonPropertyOrder](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonpropertyorder) (decorator options: [JsonPropertyOrderOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonpropertyorderoptions.html))
- [JsonRawValue](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonrawvalue) (decorator options: [JsonRawValueOptions](https://pichillilorenzo.github.io/jackson-js/latest/modules/types.html#jsonrawvalueoptions))
- [JsonRootName](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonrootname) (decorator options: [JsonRootNameOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonrootnameoptions.html))
- [JsonSerialize](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonserialize) (decorator options: [JsonSerializeOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonserializeoptions.html))
- [JsonSetter](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonsetter) (decorator options: [JsonSetterOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonsetteroptions.html))
- [JsonSubTypes](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonsubtypes) (decorator options: [JsonSubTypesOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonsubtypesoptions.html))
- [JsonTypeId](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsontypeid) (decorator options: [JsonTypeIdOptions](https://pichillilorenzo.github.io/jackson-js/latest/modules/types.html#jsontypeidoptions))
- [JsonTypeIdResolver](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsontypeidresolver) (decorator options: [JsonTypeIdResolverOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsontypeidresolveroptions.html))
- [JsonTypeInfo](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsontypeinfo) (decorator options: [JsonTypeInfoOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsontypeinfooptions.html))
- [JsonTypeName](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsontypename) (decorator options: [JsonTypeNameOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsontypenameoptions.html))
- [JsonUnwrapped](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonunwrapped) (decorator options: [JsonUnwrappedOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonunwrappedoptions.html))
- [JsonValue](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonvalue) (decorator options: [JsonValueOptions](https://pichillilorenzo.github.io/jackson-js/latest/modules/types.html#jsonvalueoptions))
- [JsonView](https://pichillilorenzo.github.io/jackson-js/latest/modules/decorators.html#jsonview) (decorator options: [JsonViewOptions](https://pichillilorenzo.github.io/jackson-js/latest/interfaces/types.jsonviewoptions.html))

## Important note

The most important decorators are:
- `@JsonProperty()`: each class property (or its getter/setter) must be decorated with this decorator, otherwise deserialization and serialization will not work properly! That's because, for example, given a JavaScript class, there isn't any way or API (such as [Reflection API for Java](https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/package-summary.html)) to get for sure all the class properties; also because, sometimes, compilers such as [TypeScript](https://www.typescriptlang.org/) and [Babel](https://babeljs.io/), can strip class properties after compilation from the class properties declaration;
- `@JsonClassType()`: this decorator, instead, is used to define the type of a class property or method parameter. This information is used during serialization and, more important, during deserialization to know about **the type of a property/parameter**. This is necessary because JavaScript isn't a strongly-typed programming language, so, for example, during deserialization, without the usage of this decorator, there isn't any way to know the specific type of a class property, such as a `Date` or a custom Class type.

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
- [Jackson-js: Powerful JavaScript decorators to serialize/deserialize objects into JSON and vice versa (Part 1)](https://itnext.io/jackson-js-powerful-javascript-decorators-to-serialize-deserialize-objects-into-json-and-vice-df952454cf?source=friends_link&sk=a65bd247eca2f95fdfddda34447a6db6)
- [Jackson-js: Examples for client (Angular) and server (Node.js) side (Part 2)](https://medium.com/@pichillilorenzo/jackson-js-examples-for-client-and-server-side-part-2-7e66df74c851?source=friends_link&sk=2636fca640284894c63cb3c689a0e822)

## Examples

Code examples can be found inside the `tests` folder and in [this example repository](https://github.com/pichillilorenzo/jackson-js-examples). The example repository gives a simple example using the `jackson-js` library with Angular 9 for the client side and two examples for the server side: one using Node.js + Express + SQLite3 (with Sequelize 5) and another one using Node.js + LoopBack 4.