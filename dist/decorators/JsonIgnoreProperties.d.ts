/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonIgnorePropertiesDecorator } from '../@types';
/**
 * Decorator that can be used to either suppress serialization of properties (during serialization),
 * or ignore processing of JSON properties read (during deserialization).
 *
 * When used for properties (fields, methods), this decorator applies to values:
 * so when applied to Iterables and Maps, it will apply to contained values, not the container.
 *
 * @example
 * ```typescript
 * @JsonIgnoreProperties({
 *   value: ['firstname', 'lastname']
 * })
 * class User {
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   email: string;
 *   @JsonProperty()
 *   firstname: string;
 *   @JsonProperty()
 *   lastname: string;
 * }
 * ```
 */
export declare const JsonIgnoreProperties: JsonIgnorePropertiesDecorator;
