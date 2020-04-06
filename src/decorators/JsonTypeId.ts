import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonTypeIdDecorator, JsonTypeIdOptions} from '../@types';
import {JsonTypeIdPrivateOptions} from '../@types/private';

export const JsonTypeId: JsonTypeIdDecorator = makeJacksonDecorator(
  (o: JsonTypeIdOptions = {}): JsonTypeIdOptions => ({enabled: true, ...o}),
  (options: JsonTypeIdOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      const privateOptions: JsonTypeIdPrivateOptions = {
        propertyKey: propertyKey.toString(),
        ...options
      };
      Reflect.defineMetadata('jackson:JsonTypeId', privateOptions, target.constructor);
    }
  });
