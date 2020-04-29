/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonSubTypesDecorator } from '../@types';
/**
 * Decorator used with {@link JsonTypeInfo} to indicate sub-types of serializable polymorphic types,
 * and to associate logical names used within JSON content.
 *
 * Note that just decorating a property or base type with this decorator does NOT enable polymorphic type handling:
 * in addition, {@link JsonTypeInfo} decorator is needed, and only in such case is subtype information used.
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
export declare const JsonSubTypes: JsonSubTypesDecorator;
