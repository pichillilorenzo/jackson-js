import {makeJacksonDecorator, isClass} from '../util';
import 'reflect-metadata';
import {JsonIncludeDecorator, JsonIncludeOptions} from '../@types';

/**
 * Enumeration used with {@link JsonInclude} to define which properties of a Class are to be included in serialization.
 */
export enum JsonIncludeType {
  /**
   * Value that indicates that property is to be always included, independent of value of the property.
   */
  ALWAYS,
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
  NON_EMPTY,
  /**
   * Value that indicates that only properties with non-null values are to be included.
   */
  NON_NULL,
  /**
   * Definition is such that:
   * - All values considered "empty" (as per {@link NON_EMPTY}) are excluded;
   * - Primitive default values are excluded, which are defined such that:
   *   - `Number`: `0`;
   *   - `Boolean`: `false`;
   *   - `String`: `''`;
   *   - `BigInt`: `BigInt(0)`;
   */
  NON_DEFAULT
}

export const JsonInclude: JsonIncludeDecorator = makeJacksonDecorator(
  (o: JsonIncludeOptions): JsonIncludeOptions => ({enabled: true, value: JsonIncludeType.ALWAYS, ...o}),
  (options: JsonIncludeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonInclude', options, target);
      return target;
    } else if (propertyKey) {
      Reflect.defineMetadata('jackson:JsonInclude', options, target.constructor, propertyKey);
    }
  });
