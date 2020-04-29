/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonManagedReferenceDecorator } from '../@types';
/**
 * Decorator used to indicate that decorated property is part of two-way linkage between fields
 * and that its role is "parent" (or "forward") link.
 * Value type (class) of property must have a single compatible property decorated with {@link JsonBackReference}.
 * Linkage is handled such that the property decorated with this decorator is handled normally
 * (serialized normally, no special handling for deserialization);
 * it is the matching back reference that requires special handling.
 *
 * All references have logical name to allow handling multiple linkages;
 * typical case would be that where nodes have both parent/child and sibling linkages.
 * If so, pairs of references should be named differently.
 * It is an error for a class too have multiple managed references with same name, even if types pointed are different.
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
 *   @JsonManagedReference()
 *   items: Item[] = [];
 * }
 *
 * class Item {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonClassType({type: () => [User]})
 *   @JsonBackReference()
 *   owner: User;
 * }
 * ```
 */
export declare const JsonManagedReference: JsonManagedReferenceDecorator;
