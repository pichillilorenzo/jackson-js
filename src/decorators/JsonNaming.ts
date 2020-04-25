/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
import {
  JsonNamingDecorator,
  JsonNamingOptions
} from '../@types';

/**
 * Strategies that defines how names of JSON properties ("external names")
 * are derived from names of POJO methods and fields ("internal names").
 */
export enum PropertyNamingStrategy {
  /**
   * Naming convention used in languages like C, where words are in lower-case letters, separated by underscores.
   */
  SNAKE_CASE,
  /**
   * Naming convention used in languages like Pascal, where words are capitalized and no separator is used between words.
   */
  UPPER_CAMEL_CASE,
  /**
   * Naming convention used in Java, where words other than first are capitalized and no separator is used between words.
   */
  LOWER_CAMEL_CASE,
  /**
   * Naming convention in which all words of the logical name are in lower case, and no separator is used between words.
   */
  LOWER_CASE,
  /**
   * Naming convention used in languages like Lisp, where words are in lower-case letters, separated by hyphens.
   */
  KEBAB_CASE,
  /**
   * Naming convention widely used as configuration properties name, where words are in lower-case letters, separated by dots.
   */
  LOWER_DOT_CASE
}

/**
 * Decorator that can be used to indicate a {@link PropertyNamingStrategy} to use for decorated class.
 *
 * @example
 * ```typescript
 * @JsonNaming({strategy: PropertyNamingStrategy.SNAKE_CASE})
 * class Book {
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   bookName: string;
 *   @JsonProperty()
 *   bookCategory: string;
 *
 *   constructor(id: number, name: string, category: string) {
 *     this.id = id;
 *     this.bookName = name;
 *     this.bookCategory = category;
 *   }
 * }
 * ```
 */
export const JsonNaming: JsonNamingDecorator = makeJacksonDecorator(
  (o: JsonNamingOptions): JsonNamingOptions => (
    {
      enabled: true,
      ...o
    }),
  (options: JsonNamingOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (descriptorOrParamIndex == null && propertyKey == null) {
      defineMetadata('JsonNaming', options, target);
      return target;
    }
  });
