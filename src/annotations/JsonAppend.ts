import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {
  JsonAppendDecorator,
  JsonAppendOptions
} from '../@types';

export const JsonAppend: JsonAppendDecorator = makeJacksonDecorator(
  (o: JsonAppendOptions): JsonAppendOptions => (
    {
      enabled: true,
      prepend: false,
      attrs: [],
      ...o
    }),
  (options: JsonAppendOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonAppend', options, target);
      return target;
    }
  });
