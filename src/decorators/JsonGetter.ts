/**
 * @packageDocumentation
 * @module Decorators
 */

import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonGetterDecorator, JsonGetterOptions} from '../@types';
import {JsonGetterPrivateOptions} from '../@types/private';
import {JacksonError} from '../core/JacksonError';

/**
 * Decorator that can be used to define a non-static,
 * no-argument value-returning (non-void) method to be used as a "getter" for a logical property.
 * It can be used as an alternative to more general {@link JsonProperty} annotation
 * (which is the recommended choice in general case).
 *
 * Getter means that when serializing Object instance of class that has this method
 * (possibly inherited from a super class), a call is made through the method,
 * and return value will be serialized as value of the property.
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
export const JsonGetter: JsonGetterDecorator = makeJacksonDecorator(
  (o: JsonGetterOptions): JsonGetterOptions => ({enabled: true, ...o}),
  (options: JsonGetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      const privateOptions: JsonGetterPrivateOptions = {
        descriptor: (typeof descriptorOrParamIndex !== 'number') ? descriptorOrParamIndex : null,
        propertyKey: propertyKey.toString(),
        ...options
      };

      if (!privateOptions.value) {
        if (descriptorOrParamIndex != null && typeof (descriptorOrParamIndex as TypedPropertyDescriptor<any>).value === 'function') {
          const methodName = propertyKey.toString();
          if (methodName.startsWith('get')) {
            privateOptions.value = methodName.substring(3);
            if (privateOptions.value.length > 0) {
              privateOptions.value = privateOptions.value.charAt(0).toLowerCase() + privateOptions.value.substring(1);
            }
          }
          if (!privateOptions.value) {
            // eslint-disable-next-line max-len
            throw new JacksonError(`Invalid usage of @JsonGetter() on ${target.constructor.name}.${propertyKey.toString()}. You must either define a non-empty @JsonGetter() option value or change the method name starting with "get".`);
          }
        } else {
          privateOptions.value = propertyKey.toString();
        }
      }

      Reflect.defineMetadata('jackson:JsonGetter', privateOptions, target.constructor, propertyKey);
      Reflect.defineMetadata('jackson:JsonVirtualProperty:' + propertyKey.toString(), privateOptions, target.constructor);
    }
  });
