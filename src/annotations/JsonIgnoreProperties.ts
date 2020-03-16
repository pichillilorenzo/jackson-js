import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonIgnorePropertiesOptions} from '../@types';

export type JsonIgnorePropertiesDecorator = (options?: JsonIgnorePropertiesOptions) => any;

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
      Reflect.defineMetadata('jackson:JsonIgnoreProperties', options, target.constructor);
      return target;
    }
  });
