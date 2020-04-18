/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, isClass, makeJacksonDecorator} from '../util';
import {
  JsonFilterDecorator,
  JsonFilterOptions
} from '../@types';

/**
 * {@link JsonFilter} type used to determine whether to serialize property as is, or to filter it out.
 */
export enum JsonFilterType {
  /**
   * Serialize all properties that are given, and filter out nothing.
   */
  SERIALIZE_ALL,
  /**
   * Serialize all properties except ones includes in {@link JsonStringifierFilterOptions.values}
   */
  SERIALIZE_ALL_EXCEPT,
  /**
   * Filters out all properties except ones includes in {@link JsonStringifierFilterOptions.values}
   */
  FILTER_OUT_ALL_EXCEPT
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
 *   @JsonProperty({value: 'stdName'})
 *   name: string;
 *   @JsonProperty()
 *   age: number;
 *   @JsonProperty()
 *   college: string;
 *   @JsonProperty()
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
export const JsonFilter: JsonFilterDecorator = makeJacksonDecorator(
  (o: JsonFilterOptions): JsonFilterOptions => ({enabled: true, ...o }),
  (options: JsonFilterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (descriptorOrParamIndex == null && isClass(target)) {
      defineMetadata('JsonFilter', options, target);
      return target;
    }
    if (propertyKey != null) {
      defineMetadata('JsonFilter', options, target.constructor, propertyKey);
    }
  });
