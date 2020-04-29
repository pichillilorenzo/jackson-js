/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
import {JsonGetterDecorator, JsonGetterOptions} from '../@types';
import {JacksonError} from '../core/JacksonError';

/**
 * Decorator that can be used to define a non-static,
 * no-argument value-returning (non-void) method to be used as a "getter" for a logical property.
 * It can be used as an alternative to more general {@link JsonProperty} decorator
 * (which is the recommended choice in general case).
 *
 * Getter means that when serializing Object instance of class that has this method
 * (possibly inherited from a super class), a call is made through the method,
 * and return value will be serialized as value of the property.
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
export const JsonGetter: JsonGetterDecorator = makeJacksonDecorator(
  (o: JsonGetterOptions): JsonGetterOptions => ({enabled: true, ...o}),
  (options: JsonGetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      if (!options.value) {
        if (descriptorOrParamIndex != null && typeof (descriptorOrParamIndex as TypedPropertyDescriptor<any>).value === 'function') {
          const methodName = propertyKey.toString();
          if (methodName.startsWith('get')) {
            options.value = methodName.substring(3);
            if (options.value.length > 0) {
              options.value = options.value.charAt(0).toLowerCase() + options.value.substring(1);
            }
          }
          if (!options.value) {
            // eslint-disable-next-line max-len
            throw new JacksonError(`Invalid usage of @JsonGetter() on ${target.constructor.name}.${propertyKey.toString()}. You must either define a non-empty @JsonGetter() option value or change the method name starting with "get".`);
          }
        } else {
          options.value = propertyKey.toString();
        }
      }

      defineMetadata('JsonGetter', options, target.constructor, propertyKey);
      defineMetadata('JsonVirtualProperty', options, target.constructor, null, {
        suffix: propertyKey.toString()
      });
    }
  });
