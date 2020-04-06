/**
 * @packageDocumentation
 * @module Decorators
 */
import 'reflect-metadata';
import { JsonAliasDecorator } from '../@types';
/**
 * Decorator that can be used to define one or more alternative names for a property,
 * accepted during deserialization as alternative to the official name.
 * Has no effect during serialization where primary name is always used.
 *
 * @example
 * ```typescript
 * class Book {
 *   @JsonProperty()
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonAlias({values: ['bkcat', 'mybkcat']})
 *   category: string;
 *
 *   constructor(name: string, category: string) {
 *     this.name = name;
 *     this.category = category;
 *   }
 * }
 * ```
 */
export declare const JsonAlias: JsonAliasDecorator;
