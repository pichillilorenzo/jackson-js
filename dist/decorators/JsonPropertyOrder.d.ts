/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonPropertyOrderDecorator } from '../@types';
/**
 * Decorator that can be used to define ordering (possibly partial) to use when serializing object properties.
 * Properties included in decorator declaration will be serialized first (in defined order),
 * followed by any properties not included in the definition.
 * This decorator definition will override any implicit orderings.
 *
 * When used for properties (fields, methods), this decorator applies to values:
 * so when applied to Iterables and Maps, it will apply to contained values, not the container.
 *
 * @example
 * ```typescript
 * @JsonPropertyOrder({value: ['email', 'lastname']})
 * class User {
 *   @JsonProperty()
 *   email: string;
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   firstname: string;
 *   @JsonProperty()
 *   lastname: string;
 * }
 * ```
 */
export declare const JsonPropertyOrder: JsonPropertyOrderDecorator;
