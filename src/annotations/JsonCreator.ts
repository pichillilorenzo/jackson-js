import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonCreatorDecorator, JsonCreatorOptions} from '../@types';
import {JsonCreatorPrivateOptions} from '../@types/private';
import {JacksonError} from '..';

export const defaultCreatorName = 'defaultCreatorName';

export const JsonCreator: JsonCreatorDecorator = makeJacksonDecorator(
  (o: JsonCreatorOptions = {}): JsonCreatorOptions => ({
    enabled: true,
    name: defaultCreatorName,
    ...o
  }),
  (options: JsonCreatorOptions, target, propertyKey, descriptorOrParamIndex) => {
    const privateOptions: JsonCreatorPrivateOptions = {
      ctor: null,
      method: null,
      ...options
    };
    if (descriptorOrParamIndex && typeof descriptorOrParamIndex !== 'number' && typeof descriptorOrParamIndex.value === 'function') {
      privateOptions.method = descriptorOrParamIndex.value;
      if (options.name && Reflect.hasMetadata('jackson:JsonCreator:' + options.name, target)) {
        throw new JacksonError(`Already had a @JsonCreator with name "${options.name}" for Class "${target.constructor.name}".`);
      }
      Reflect.defineMetadata('jackson:JsonCreator:' + options.name, privateOptions, target);
    } else if (!descriptorOrParamIndex && isClass(target)) {
      privateOptions.ctor = target;
      // get original constructor
      while (privateOptions.ctor.toString().trim().startsWith('class extends target {')) {
        privateOptions.ctor = Object.getPrototypeOf(privateOptions.ctor);
      }

      Reflect.defineMetadata('jackson:JsonCreator:' + options.name, privateOptions, target);
      return target;
    }
  });
