/**
 * @packageDocumentation
 * @module Decorators
 */
import 'reflect-metadata';
import { JsonRootNameDecorator } from '../@types';
/**
 * Decorator used to indicate name to use for root-level wrapping.
 *
 * @example
 * ```typescript
 * @JsonRootName()
 * class User {
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   email: string;
 * }
 * ```
 */
export declare const JsonRootName: JsonRootNameDecorator;
