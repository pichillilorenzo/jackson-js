/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonManagedReferenceDecorator } from '../@types';
/**
 * Decorator used to indicate that decorated property is part of two-way linkage between fields
 * and that its role is "parent" (or "forward") link.
 * Value type (class) of property must have a single compatible property annotated with {@link JsonBackReference}.
 * Linkage is handled such that the property annotated with this annotation is handled normally
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
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   email: string;
 *   @JsonProperty()
 *   firstname: string;
 *   @JsonProperty()
 *   lastname: string;
 *
 *   @JsonProperty()
 *   @JsonClass({class: () => [Array, [Item]]})
 *   @JsonManagedReference()
 *   items: Item[] = [];
 * }
 *
 * class Item {
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonClass({class: () => [User]})
 *   @JsonBackReference()
 *   owner: User;
 * }
 * ```
 */
export declare const JsonManagedReference: JsonManagedReferenceDecorator;
