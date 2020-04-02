import {makeJacksonDecorator, isClass} from '../util';
import 'reflect-metadata';
import {JsonSubTypesDecorator, JsonSubTypesOptions} from '../@types';

export const JsonSubTypes: JsonSubTypesDecorator = makeJacksonDecorator(
  (o: JsonSubTypesOptions): JsonSubTypesOptions => ({enabled: true, ...o}),
  (options: JsonSubTypesOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonSubTypes', options, target);
      return target;
    }
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonSubTypes', options, target.constructor, propertyKey);
    }
  });
