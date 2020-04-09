/**
 * @packageDocumentation
 * @module Decorators
 */

import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonSetterDecorator, JsonSetterOptions} from '../@types';
import {JsonSetterPrivateOptions} from '../@types/private';
import {JacksonError} from '../core/JacksonError';

export const JsonSetter: JsonSetterDecorator = makeJacksonDecorator(
  (o: JsonSetterOptions): JsonSetterOptions => ({enabled: true, ...o}),
  (options: JsonSetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      const privateOptions: JsonSetterPrivateOptions = {
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

      Reflect.defineMetadata('jackson:JsonSetter', privateOptions, target.constructor, privateOptions.value);
    }
  });
