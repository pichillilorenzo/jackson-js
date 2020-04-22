/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonIgnoreDecorator } from '../@types';
/**
 * Decorator that indicates that the logical property that the accessor
 * (field, getter/setter method or Creator parameter [of JsonCreator-annotated constructor or factory method])
 * is to be ignored during serialization and deserialization functionality.
 *
 * @example
 * ```typescript
 * class Item {
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonIgnore()
 *   category: string;
 * }
 * ```
 */
export declare const JsonIgnore: JsonIgnoreDecorator;
