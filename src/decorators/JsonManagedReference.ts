import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonManagedReferenceDecorator, JsonManagedReferenceOptions} from '../@types';
import {JacksonError} from '../core/JacksonError';
import {JsonManagedReferencePrivateOptions} from '../@types/private';

export const JsonManagedReference: JsonManagedReferenceDecorator = makeJacksonDecorator(
  (o: JsonManagedReferenceOptions = {}): JsonManagedReferenceOptions => ({
    enabled: true,
    value: 'defaultReference',
    ...o
  }),
  (options: JsonManagedReferenceOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      if (Reflect.hasMetadata('jackson:JsonManagedReference:' + options.value, target.constructor)) {
        // eslint-disable-next-line max-len
        throw new JacksonError(`Multiple managed-reference properties with name "${options.value}" at ${target.constructor}["${propertyKey.toString()}"].'`);
      }

      const privateOptions: JsonManagedReferencePrivateOptions = {
        propertyKey: propertyKey.toString(),
        ...options
      };

      Reflect.defineMetadata('jackson:JsonManagedReference', privateOptions, target.constructor, propertyKey);
      Reflect.defineMetadata('jackson:JsonManagedReference:' + privateOptions.value, privateOptions, target.constructor);
      Reflect.defineMetadata('jackson:JsonManagedReference:' + propertyKey.toString(), privateOptions, target.constructor);
    }
  });
