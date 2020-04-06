import {makeJacksonDecorator, isClass} from '../util';
import 'reflect-metadata';
import {JsonSubTypesDecorator, JsonSubTypesOptions} from '../@types';

export const JsonSubTypes: JsonSubTypesDecorator = makeJacksonDecorator(
  (o: JsonSubTypesOptions): JsonSubTypesOptions => ({enabled: true, ...o}),
  (options: JsonSubTypesOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && typeof descriptorOrParamIndex !== 'number' && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonSubTypes', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      Reflect.defineMetadata(
        'jackson:JsonSubTypesParam:' + descriptorOrParamIndex.toString(),
        options, target, (propertyKey) ? propertyKey : 'constructor');
    }
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonSubTypes', options, target.constructor, propertyKey);
    }
  });
