import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonUnwrappedDecorator, JsonUnwrappedOptions} from '../@types';

export const JsonUnwrapped: JsonUnwrappedDecorator = makeJacksonDecorator(
  (o: JsonUnwrappedOptions = {}): JsonUnwrappedOptions => ({
    enabled: true,
    prefix: '',
    suffix: '',
    ...o
  }),
  (options: JsonUnwrappedOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (typeof descriptorOrParamIndex !== 'number') {
      Reflect.defineMetadata('jackson:JsonUnwrapped', options, target, propertyKey);
      Reflect.defineMetadata('jackson:JsonUnwrapped:' + propertyKey.toString(), options, target);
      Reflect.defineMetadata('jackson:JsonUnwrapped:' + propertyKey.toString(), options, target.constructor);
    }
  });
