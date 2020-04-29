/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonNamingDecorator } from '../@types';
/**
 * Strategies that defines how names of JSON properties ("external names")
 * are derived from names of POJO methods and fields ("internal names").
 */
export declare enum PropertyNamingStrategy {
    /**
     * Naming convention used in languages like C, where words are in lower-case letters, separated by underscores.
     */
    SNAKE_CASE = 0,
    /**
     * Naming convention used in languages like Pascal, where words are capitalized and no separator is used between words.
     */
    UPPER_CAMEL_CASE = 1,
    /**
     * Naming convention used in Java, where words other than first are capitalized and no separator is used between words.
     */
    LOWER_CAMEL_CASE = 2,
    /**
     * Naming convention in which all words of the logical name are in lower case, and no separator is used between words.
     */
    LOWER_CASE = 3,
    /**
     * Naming convention used in languages like Lisp, where words are in lower-case letters, separated by hyphens.
     */
    KEBAB_CASE = 4,
    /**
     * Naming convention widely used as configuration properties name, where words are in lower-case letters, separated by dots.
     */
    LOWER_DOT_CASE = 5
}
/**
 * Decorator that can be used to indicate a {@link PropertyNamingStrategy} to use for decorated class.
 *
 * @example
 * ```typescript
 * @JsonNaming({strategy: PropertyNamingStrategy.SNAKE_CASE})
 * class Book {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   bookName: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
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
export declare const JsonNaming: JsonNamingDecorator;
