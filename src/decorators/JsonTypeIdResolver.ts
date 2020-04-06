import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonTypeIdResolverDecorator, JsonTypeIdResolverOptions} from '../@types';

export const JsonTypeIdResolver: JsonTypeIdResolverDecorator = makeJacksonDecorator(
  (o: JsonTypeIdResolverOptions): JsonTypeIdResolverOptions => (
    {
      enabled: true,
      ...o
    }),
  (options: JsonTypeIdResolverOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && typeof descriptorOrParamIndex !== 'number' && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonTypeIdResolver', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      Reflect.defineMetadata(
        'jackson:JsonTypeIdResolverParam:' + descriptorOrParamIndex.toString(),
        options, target, (propertyKey) ? propertyKey : 'constructor');
    }
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonTypeIdResolver', options, target.constructor, propertyKey);
    }
  });
