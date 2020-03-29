import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonSetterDecorator, JsonSetterOptions} from '../@types';
import {JsonSetterPrivateOptions} from '../@types/private';

export const JsonSetter: JsonSetterDecorator = makeJacksonDecorator(
  (o: JsonSetterOptions): JsonSetterOptions => ({enabled: true, ...o}),
  (options: JsonSetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      const privateOptions: JsonSetterPrivateOptions = {
        propertyKey: propertyKey.toString(),
        ...options
      };
      Reflect.defineMetadata('jackson:JsonSetter', privateOptions, target, privateOptions.value);
      Reflect.defineMetadata('jackson:JsonSetter', privateOptions, target.constructor, privateOptions.value);
    }
  });
