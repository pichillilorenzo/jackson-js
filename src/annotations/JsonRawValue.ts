import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonRawValueDecorator, JsonRawValueOptions} from '../@types';

export const JsonRawValue: JsonRawValueDecorator = makeJacksonDecorator(
  (o: JsonRawValueOptions): JsonRawValueOptions => ({enabled: true, ...o}),
  (options: JsonRawValueOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      Reflect.defineMetadata('jackson:JsonRawValue', options, target, propertyKey);
      Reflect.defineMetadata('jackson:JsonRawValue', options, target.constructor, propertyKey);
    }
  });
