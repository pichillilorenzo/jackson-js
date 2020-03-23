import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonAnyGetterDecorator, JsonAnyGetterOptions} from '../@types';
import {JacksonError} from '../core/JacksonError';
import {JsonAnyGetterPrivateOptions} from '../@types/private';

export const JsonAnyGetter: JsonAnyGetterDecorator = makeJacksonDecorator(
  (o: JsonAnyGetterOptions): JsonAnyGetterOptions => ({enabled: true, ...o}),
  (options: JsonAnyGetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      const privateOptions: JsonAnyGetterPrivateOptions = {
        propertyKey: propertyKey.toString(),
        ...options
      };
      if (Reflect.hasMetadata('jackson:JsonAnyGetter', target)) {
        throw new JacksonError(`Multiple 'any-getters' defined for "${target.constructor.name}".`);
      }
      Reflect.defineMetadata('jackson:JsonAnyGetter', privateOptions, target);
    }
  });
