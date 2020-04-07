/**
 * @packageDocumentation
 * @module Decorators
 */

import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonIgnoreDecorator, JsonIgnoreOptions} from '../@types';

export const JsonIgnore: JsonIgnoreDecorator = makeJacksonDecorator(
  (o: JsonIgnoreOptions): JsonIgnoreOptions => ({enabled: true, ...o}),
  (options: JsonIgnoreOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonIgnore', options, target.constructor, propertyKey);
    }
  });
