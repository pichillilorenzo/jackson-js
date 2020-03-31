import {makeJacksonDecorator, isClass} from '../util';
import 'reflect-metadata';
import {JsonRootNameDecorator, JsonRootNameOptions} from '../@types';

export const JsonRootName: JsonRootNameDecorator = makeJacksonDecorator(
  (o: JsonRootNameOptions = {}): JsonRootNameOptions => ({enabled: true, ...o}),
  (options: JsonRootNameOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      options.value = (options.value == null) ? (target as ObjectConstructor).name : options.value;
      Reflect.defineMetadata('jackson:JsonRootName', options, target);
      Reflect.defineMetadata('jackson:JsonRootName', options, target.constructor);
      return target;
    }
  });
