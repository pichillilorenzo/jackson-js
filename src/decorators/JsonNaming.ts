/**
 * @packageDocumentation
 * @module Decorators
 */

import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {
  JsonNamingDecorator,
  JsonNamingOptions
} from '../@types';

export enum JsonNamingStrategy {
  SNAKE_CASE,
  UPPER_CAMEL_CASE,
  LOWER_CAMEL_CASE,
  LOWER_CASE,
  KEBAB_CASE,
  LOWER_DOT_CASE
}

export const JsonNaming: JsonNamingDecorator = makeJacksonDecorator(
  (o: JsonNamingOptions): JsonNamingOptions => (
    {
      enabled: true,
      ...o
    }),
  (options: JsonNamingOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonNaming', options, target);
      return target;
    }
  });
