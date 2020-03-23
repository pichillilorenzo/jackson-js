import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonValueDecorator, JsonValueOptions} from '../@types';
import {JsonValuePrivateOptions} from '../@types/private';

export const JsonValue: JsonValueDecorator = makeJacksonDecorator(
  (o: JsonValueOptions): JsonValueOptions => ({enabled: true, ...o}),
  (options: JsonValueOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (typeof descriptorOrParamIndex !== 'number') {
      const privateOptions: JsonValuePrivateOptions = {
        propertyKey: propertyKey.toString(),
        ...options
      };
      Reflect.defineMetadata('jackson:JsonValue', privateOptions, target);
    }
  });
