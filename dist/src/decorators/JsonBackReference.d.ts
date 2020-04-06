/**
 * @packageDocumentation
 * @module Decorators
 */
import 'reflect-metadata';
import { JsonBackReferenceDecorator } from '../@types';
/**
 * Decorator used to indicate that associated property is part of two-way linkage between fields;
 * and that its role is "child" (or "back") link. Value type of the property must be a Class:
 * it can not be an `Iterable` or a `Map`.
 * Linkage is handled such that the property annotated with this annotation is not serialized;
 * and during deserialization, its value is set to instance that has
 * the "managed" (forward) link (see {@link JsonManagedReference}).
 *
 * All references have logical name to allow handling multiple linkages;
 * typical case would be that where nodes have both parent/child and sibling linkages.
 * If so, pairs of references should be named differently.
 * It is an error for a class to have multiple back references with same name,
 * even if types pointed are different.
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
export declare const JsonBackReference: JsonBackReferenceDecorator;
