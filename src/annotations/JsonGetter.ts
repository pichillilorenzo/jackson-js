import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonGetterDecorator, JsonGetterOptions} from '../@types';
import {JsonGetterPrivateOptions} from '../@types/private';

export const JsonGetter: JsonGetterDecorator = makeJacksonDecorator(
  (o: JsonGetterOptions): JsonGetterOptions => ({enabled: true, ...o}),
  (options: JsonGetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      const privateOptions: JsonGetterPrivateOptions = {
        propertyKey: propertyKey.toString(),
        ...options
      };
      Reflect.defineMetadata('jackson:JsonGetter', privateOptions, target, privateOptions.value);
      Reflect.defineMetadata('jackson:JsonGetter', privateOptions, target.constructor, privateOptions.value);
    }
  });
