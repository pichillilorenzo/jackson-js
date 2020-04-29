/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonTypeIdDecorator } from '../@types';
/**
 * Decorator that can be used on a property accessor (field, getter or setter, constructor parameter)
 * to indicate that the property is to contain type id to use when including polymorphic type information.
 * This decorator should only be used if the intent is to override generation of standard type id:
 * if so, value of the property will be accessed during serialization and used as the type id.
 *
 * On deserialization, this decorator has no effect.
 *
 * On serialization, this decorator will exclude property from being serialized along other properties;
 * instead, its value is serialized as the type identifier.
 *
 * @example
 * ```typescript
 * @JsonTypeInfo({
 *   use: JsonTypeInfoId.NAME,
 *   include: JsonTypeInfoAs.WRAPPER_OBJECT
 * })
 * @JsonSubTypes({
 *   types: [
 *     {class: () => Dog, name: 'dog'},
 *     {class: () => Cat, name: 'cat'},
 *   ]
 * })
 * class Animal {
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   name: string;
 * }
 *
 * @JsonTypeName({value: 'dog'})
 * class Dog extends Animal {
 *   @JsonTypeId() @JsonClassType({type: () => [String]})
 *   typeId: string;
 * }
 *
 * @JsonTypeName({value: 'cat'})
 * class Cat extends Animal {
 *   @JsonTypeId() @JsonClassType({type: () => [String]})
 *   getTypeId(): string {
 *     return 'CatTypeId';
 *   }
 * }
 * ```
 */
export declare const JsonTypeId: JsonTypeIdDecorator;
