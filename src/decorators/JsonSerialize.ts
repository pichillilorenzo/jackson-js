/**
 * @packageDocumentation
 * @module Decorators
 */

import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonSerializeDecorator, JsonSerializeOptions} from '../@types';

export const JsonSerialize: JsonSerializeDecorator = makeJacksonDecorator(
  (o: JsonSerializeOptions): JsonSerializeOptions => ({enabled: true, ...o}),
  (options: JsonSerializeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonSerialize', options, target);
      return target;
    }
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonSerialize', options, target.constructor, propertyKey);
    }
  });
