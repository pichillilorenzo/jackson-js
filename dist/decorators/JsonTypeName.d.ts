/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonTypeNameDecorator } from '../@types';
/**
 * Decorator used for binding logical name that the decorated class has.
 * Used with {@link JsonTypeInfo}.
 *
 * @example
 * ```typescript
 * @JsonTypeInfo({
 *   use: JsonTypeInfoId.NAME,
 *   include: JsonTypeInfoAs.PROPERTY
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
 *
 * }
 *
 * @JsonTypeName({value: 'cat'})
 * class Cat extends Animal {
 *
 * }
 * ```
 */
export declare const JsonTypeName: JsonTypeNameDecorator;
