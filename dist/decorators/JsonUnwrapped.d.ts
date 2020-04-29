/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonUnwrappedDecorator } from '../@types';
/**
 * Decorator used to indicate that a property should be serialized "unwrapped";
 * that is, if it would be serialized as JSON Object, its properties are
 * instead included as properties of its containing Object.
 *
 * It cannot be applied on Iterables and in conjunction of {@link JsonTypeInfo} as it requires use of type information.
 *
 * @example
 * ```typescript
 * class User {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty()
 *   @JsonUnwrapped()
 *   @JsonClassType({type: () => [Name]})
 *   name: Name;
 * }
 *
 * class Name {
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   first: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   last: string;
 * }
 * ```
 */
export declare const JsonUnwrapped: JsonUnwrappedDecorator;
