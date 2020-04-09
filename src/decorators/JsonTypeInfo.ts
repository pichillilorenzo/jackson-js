/**
 * @packageDocumentation
 * @module Decorators
 */

import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonTypeInfoDecorator, JsonTypeInfoOptions} from '../@types';

export enum JsonTypeInfoId {
  NAME
}

export enum JsonTypeInfoAs {
  PROPERTY,
  WRAPPER_OBJECT,
  WRAPPER_ARRAY
}

export const JsonTypeInfo: JsonTypeInfoDecorator = makeJacksonDecorator(
  (o: JsonTypeInfoOptions): JsonTypeInfoOptions => (
    {
      enabled: true,
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.PROPERTY,
      property: '@type',
      ...o
    }),
  (options: JsonTypeInfoOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && typeof descriptorOrParamIndex !== 'number' && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonTypeInfo', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      Reflect.defineMetadata(
        'jackson:JsonTypeInfoParam:' + descriptorOrParamIndex.toString(),
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor');
    }
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonTypeInfo', options, target.constructor, propertyKey);
    }
  });
