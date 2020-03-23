import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonTypeNameDecorator, JsonTypeNameOptions} from '../@types';
import {JsonTypeNamePrivateOptions} from '../@types/private';

export const JsonTypeName: JsonTypeNameDecorator = makeJacksonDecorator(
  (o: JsonTypeNameOptions): JsonTypeNameOptions => ({enabled: true, ...o}),
  (options: JsonTypeNameOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      const privateOptions: JsonTypeNamePrivateOptions = {
        ctor: target,
        ...options
      };
      Reflect.defineMetadata('jackson:JsonTypeName', privateOptions, target);
      Reflect.defineMetadata('jackson:JsonTypeName:' + options.value, privateOptions, target);
      Reflect.defineMetadata('jackson:JsonTypeName:' + (target as ObjectConstructor).name, privateOptions, target);
      return target;
    }
  });
