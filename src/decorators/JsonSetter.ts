/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
import {JsonSetterDecorator, JsonSetterOptions} from '../@types';
import {JsonSetterPrivateOptions} from '../@types/private';
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
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   firstname: string;
 *   @JsonProperty()
 *   lastname: string;
 *   @JsonProperty()
 *   fullname: string[];
 *
 *   @JsonGetter()
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
      const privateOptions: JsonSetterPrivateOptions = {
        descriptor: (typeof descriptorOrParamIndex !== 'number') ? descriptorOrParamIndex : null,
        propertyKey: propertyKey.toString(),
        ...options
      };

      if (!privateOptions.value) {
        if (descriptorOrParamIndex != null && typeof (descriptorOrParamIndex as TypedPropertyDescriptor<any>).value === 'function') {
          const methodName = propertyKey.toString();
          if (methodName.startsWith('set')) {
            privateOptions.value = methodName.substring(3);
            if (privateOptions.value.length > 0) {
              privateOptions.value = privateOptions.value.charAt(0).toLowerCase() + privateOptions.value.substring(1);
            }
          }
          if (!privateOptions.value) {
            // eslint-disable-next-line max-len
            throw new JacksonError(`Invalid usage of @JsonSetter() on ${target.constructor.name}.${propertyKey.toString()}. You must either define a non-empty @JsonSetter() option value or change the method name starting with "set".`);
          }
        } else {
          privateOptions.value = propertyKey.toString();
        }
      }

      defineMetadata('JsonSetter', privateOptions, target.constructor, propertyKey);
      defineMetadata('JsonVirtualProperty', privateOptions, target.constructor, null, {
        suffix: propertyKey.toString()
      });
    }
  });
