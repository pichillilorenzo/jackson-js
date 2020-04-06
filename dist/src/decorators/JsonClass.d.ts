/**
 * @packageDocumentation
 * @module Decorators
 */
import 'reflect-metadata';
import { JsonClassDecorator } from '../@types';
/**
 * Decorator used to define the type of a class property or method parameter.
 * Used during serialization and, more important, during deserialization to know about the type of a property/parameter.
 *
 * This is necessary because JavaScript isn't a typed programming language,
 * so, for example, during deserialization, without the usage of this decorator, there isn't any way to know
 * the specific type of class property, such as a `Date` or a custom Class, except the primitive types.
 *
 * @example
 * ```typescript
 * class Book {
 *   @JsonProperty()
 *   name: string;
 *
 *   @JsonProperty()
 *   category: string;
 * }
 *
 * class Writer {
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonClass({class: () => [Array, [Book]]})
 *   books: Book[] = [];
 * }
 * ```
 */
export declare const JsonClass: JsonClassDecorator;
