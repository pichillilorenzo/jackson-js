/**
 * @packageDocumentation
 * @module Decorators
 */

import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonIgnorePropertiesDecorator, JsonIgnorePropertiesOptions} from '../@types';

export const JsonIgnoreProperties: JsonIgnorePropertiesDecorator = makeJacksonDecorator(
  (o: JsonIgnorePropertiesOptions): JsonIgnorePropertiesOptions => (
    {
      enabled: true,
      allowGetters: false,
      allowSetters: false,
      ignoreUnknown: false,
      value: [],
      ...o
    }),
  (options: JsonIgnorePropertiesOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonIgnoreProperties', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      Reflect.defineMetadata(
        'jackson:JsonIgnorePropertiesParam:' + descriptorOrParamIndex.toString(),
        options, target, (propertyKey) ? propertyKey : 'constructor');
    }
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonIgnoreProperties', options, target.constructor, propertyKey);
    }
  });
