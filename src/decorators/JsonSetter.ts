/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
import {JsonSetterDecorator, JsonSetterOptions} from '../@types';
import {JacksonError} from '../core/JacksonError';

/**
 * Used with {@link JsonSetter} (for properties `nulls` and `contentNulls`) to define
 * how explicit `null` values from input are handled.
 */
export enum JsonSetterNulls {
  /**
   * Value that indicates that an exception (of type that indicates input mismatch problem)
   * is to be thrown, to indicate that null values are not accepted.
   */
  FAIL,
  /**
   * Value that indicates that an input null should result in assignment of JavaScript `null`value
   * of matching property.
   */
  SET,
  /**
   * Value that indicates that an input null value should be skipped and no assignment is to be made.
   */
  SKIP
}

/**
 * Decorator that can be used to define a non-static, single-argument method to be used as a "setter"
 * for a logical property as an alternative to recommended {@link JsonProperty} decorator.
 *
 * Setter means that when deserializing Object instance of class that has this method
 * (possibly inherited from a super class), a call is made through the method.
 *
 * @example
 * ```typescript
 * class User {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   firstname: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   lastname: string;
 *   @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
 *   fullname: string[];
 *
 *   @JsonGetter() @JsonClassType({type: () => [String]})
 *   getFullname(): string {
 *     return this.firstname + ' ' + this.lastname;
 *   }
 *
 *   @JsonSetter()
 *   setFullname(fullname: string) {
 *     this.fullname = fullname.split(' ');
 *   }
 * }
 * ```
 */
export const JsonSetter: JsonSetterDecorator = makeJacksonDecorator(
  (o: JsonSetterOptions): JsonSetterOptions => ({
    enabled: true,
    nulls: JsonSetterNulls.SET,
    contentNulls: JsonSetterNulls.SET,
    ...o
  }),
  (options: JsonSetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      if (!options.value) {
        if (descriptorOrParamIndex != null && typeof (descriptorOrParamIndex as TypedPropertyDescriptor<any>).value === 'function') {
          const methodName = propertyKey.toString();
          if (methodName.startsWith('set')) {
            options.value = methodName.substring(3);
            if (options.value.length > 0) {
              options.value = options.value.charAt(0).toLowerCase() + options.value.substring(1);
            }
          }
          if (!options.value) {
            // eslint-disable-next-line max-len
            throw new JacksonError(`Invalid usage of @JsonSetter() on ${target.constructor.name}.${propertyKey.toString()}. You must either define a non-empty @JsonSetter() option value or change the method name starting with "set".`);
          }
        } else {
          options.value = propertyKey.toString();
        }
      }

      defineMetadata('JsonSetter', options, target.constructor, propertyKey);
      defineMetadata('JsonVirtualProperty', options, target.constructor, null, {
        suffix: propertyKey.toString()
      });
    }
  });
