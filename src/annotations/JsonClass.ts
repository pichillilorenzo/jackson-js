import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonClassDecorator, JsonClassOptions} from '../@types';

export const JsonClass: JsonClassDecorator = makeJacksonDecorator(
  (o: JsonClassOptions): JsonClassOptions => ({enabled: true, ...o}),
  (options: JsonClassOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      Reflect.defineMetadata(
        'jackson:JsonClassParam:' + descriptorOrParamIndex.toString(),
        options, target, (propertyKey) ? propertyKey : 'constructor');
    }
    if (propertyKey) {
      Reflect.defineMetadata('jackson:JsonClass', options, target.constructor, propertyKey);
      Reflect.defineMetadata('jackson:JsonClass:' + propertyKey.toString(), options, target.constructor);
    }
  });
