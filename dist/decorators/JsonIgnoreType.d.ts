/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonIgnoreTypeDecorator } from '../@types';
/**
 * Decorator that indicates that all properties of decorated type
 * are to be ignored during serialization and deserialization.
 *
 * @example
 * ```typescript
 * class User {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   email: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   firstname: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   lastname: string;
 *
 *   @JsonProperty()
 *   @JsonClassType({type: () => [Array, [Item]]})
 *   items: Item[] = [];
 * }
 *
 * @JsonIgnoreType()
 * class Item {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   name: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   category: string;
 *
 *   @JsonProperty()
 *   @JsonClassType({type: () => [User]})
 *   owner: User;
 * }
 * ```
 */
export declare const JsonIgnoreType: JsonIgnoreTypeDecorator;
