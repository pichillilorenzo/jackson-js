import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonTypeNameOptions} from '../@types';

export type JsonTypeNameDecorator = (options?: JsonTypeNameOptions) => any;

export const JsonTypeName: JsonTypeNameDecorator = makeJacksonDecorator(
  (o: JsonTypeNameOptions): JsonTypeNameOptions => ({enabled: true, ...o}),
  (options: JsonTypeNameOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (options.value && options.value.trim() !== '' && !descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonTypeName', options.value, target);
      Reflect.defineMetadata('jackson:JsonTypeName:' + options.value, target, target);
      Reflect.defineMetadata('jackson:JsonTypeName:' + (target as ObjectConstructor).name, target, target);
      return target;
    }
  });
