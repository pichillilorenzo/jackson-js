/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonFilterDecorator } from '../@types';
/**
 * {@link JsonFilter} type used to determine whether to serialize property as is, or to filter it out.
 */
export declare enum JsonFilterType {
    /**
     * Serialize all properties that are given, and filter out nothing.
     */
    SERIALIZE_ALL = 0,
    /**
     * Serialize all properties except ones includes in {@link JsonStringifierFilterOptions.values}
     */
    SERIALIZE_ALL_EXCEPT = 1,
    /**
     * Filters out all properties except ones includes in {@link JsonStringifierFilterOptions.values}
     */
    FILTER_OUT_ALL_EXCEPT = 2
}
/**
 * Decorator used to indicate which logical filter is to be used for filtering out properties of type (class) decorated.
 * Association made by this decorator declaring ids of filters,
 * and {@link JsonStringifierContext} providing matching filters by id.
 *
 * When used for properties (fields, methods), this decorator applies to values:
 * so when applied to Iterables and Maps, it will apply to contained values, not the container.
 *
 * @example
 * ```typescript
 * @JsonFilter({value: 'studentFilter'})
 * class Student {
 *   @JsonProperty({value: 'stdName'}) @JsonClassType({type: () => [String]})
 *   name: string;
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   age: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   college: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   city: string;
 *
 *   constructor(name: string, age: number, college: string, city: string) {
 *     this.name = name;
 *     this.age = age;
 *     this.college = college;
 *     this.city = city;
 *   }
 * }
 * const student = new Student('Mohit', 30, 'ABCD', 'Varanasi');
 *
 * const objectMapper = new ObjectMapper();
 *
 * const jsonData = objectMapper.stringify<Student>(student, {
 *   filters: {
 *     studentFilter: {
 *       type: JsonFilterType.SERIALIZE_ALL_EXCEPT,
 *       values: ['stdName', 'city']
 *     }
 *   }
 * });
 * ```
 */
export declare const JsonFilter: JsonFilterDecorator;
