/**
 * @packageDocumentation
 * @module Decorators
 */
import 'reflect-metadata';
import { JsonIgnorePropertiesDecorator } from '../@types';
/**
 * Annotation that can be used to either suppress serialization of properties (during serialization),
 * or ignore processing of JSON properties read (during deserialization).
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
