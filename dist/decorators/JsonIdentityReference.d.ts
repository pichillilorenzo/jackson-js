/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonIdentityReferenceDecorator } from '../@types';
/**
 * Decorator that can be used for customizing details of a reference to Objects for
 * which "Object Identity" is enabled (see {@link JsonIdentityInfo}).
 * The main use case is that of enforcing use of Object Id even for the first time an Object is referenced,
 * instead of first instance being serialized as full Class.
 *
 * @example
 * ```typescript
 * @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'User'})
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
 * @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'Item'})
 * @JsonIdentityReference({alwaysAsId: true})
 * class Item {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonClassType({type: () => [User]})
 *   owner: User;
 * }
 * ```
 */
export declare const JsonIdentityReference: JsonIdentityReferenceDecorator;
