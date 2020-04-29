/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonIncludeDecorator } from '../@types';
/**
 * Enumeration used with {@link JsonInclude} to define which properties of a Class are to be included in serialization.
 */
export declare enum JsonIncludeType {
    /**
     * Value that indicates that property is to be always included, independent of value of the property.
     */
    ALWAYS = 0,
    /**
     * Value that indicates that only properties with null value, or what is considered empty, are not to be included.
     * Definition of emptiness is data type specific; see below for details on actual handling.
     *
     * Default emptiness for all types includes:
     * - `null` values;
     * - For `Set` and `Map`, method `size()` is called;
     * - For `Array`, empty arrays are ones with length of 0;
     * - For `String`, empty strings are ones with length of 0.
     */
    NON_EMPTY = 1,
    /**
     * Value that indicates that only properties with non-null values are to be included.
     */
    NON_NULL = 2,
    /**
     * Definition is such that:
     * - All values considered "empty" (as per {@link NON_EMPTY}) are excluded;
     * - Primitive default values are excluded, which are defined such that:
     *   - `Number`: `0`;
     *   - `Boolean`: `false`;
     *   - `String`: `''`;
     *   - `BigInt`: `BigInt(0)`;
     */
    NON_DEFAULT = 3,
    /**
     * Value that indicates that separate `filter` Object (specified by {@link JsonIncludeOptions.valueFilter}
     * for value itself, and/or {@link JsonIncludeOptions.contentFilter}
     * for contents of structured types) is to be used for determining inclusion criteria.
     */
    CUSTOM = 4
}
/**
 * Decorator used to indicate when value of the decorated property
 * or all properties of the decorated class, is to be serialized.
 * Without decorator property values are always included,
 * but by using this decorator one can specify simple exclusion rules to reduce amount of properties to write out.
 *
 * Note that the main inclusion criteria is checked on JavaScript object level,
 * for the decorated type, and NOT on JSON output.
 * So, even with {@link JsonIncludeType.NON_NULL} it is possible that JSON null values are output,
 * if object reference in question is not `null`.
 *
 * @example
 * ```typescript
 * @JsonInclude({value: JsonIncludeType.NON_EMPTY})
 * class Employee {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   name: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   dept: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   address: string;
 *   @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
 *   phones: string[];
 *   @JsonProperty() @JsonClassType({type: () => [Map, [String, String]]})
 *   otherInfo: Map<string, string>;
 * }
 * ```
 */
export declare const JsonInclude: JsonIncludeDecorator;
