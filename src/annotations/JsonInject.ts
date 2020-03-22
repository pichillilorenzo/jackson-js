import {getArgumentNames, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonInjectOptions} from '../@types';

export type JsonInjectDecorator = (options?: JsonInjectOptions) => any;

export const JsonInject: JsonInjectDecorator = makeJacksonDecorator(
  (o: JsonInjectOptions = {}): JsonInjectOptions => ({
    enabled: true,
    useInput: true,
    ...o
  }),
  (options: JsonInjectOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!options.value && propertyKey != null) {
      options.value = propertyKey.toString();
    }

    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      if (!options.value) {
        const argNames = getArgumentNames(target, !!target.constructor);
        options.value = argNames[descriptorOrParamIndex];
      }
      Reflect.defineMetadata('jackson:JsonInjectParam:' + descriptorOrParamIndex.toString(), options, target);
    }

    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonInject', options, target, propertyKey);
    }
  });
