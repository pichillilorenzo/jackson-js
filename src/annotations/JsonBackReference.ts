import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonBackReferenceOptions} from '../@types';
import {JacksonError} from '../core/JacksonError';
import {JsonBackReferencePrivateOptions} from '../@types/private';

export type JsonBackReferenceDecorator = (options?: JsonBackReferenceOptions) => any;

export const JsonBackReference: JsonBackReferenceDecorator = makeJacksonDecorator(
  (o: JsonBackReferenceOptions = {}): JsonBackReferenceOptions => ({
    enabled: true,
    value: 'defaultReference',
    ...o
  }),
  (options: JsonBackReferenceOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (Reflect.hasMetadata('jackson:JsonBackReference:' + options.value, target.constructor)) {
      // eslint-disable-next-line max-len
      throw new JacksonError(`Multiple back-reference properties with name "${options.value}" at ${target.constructor}["${propertyKey.toString()}"].'`);
    }

    const privateOptions: JsonBackReferencePrivateOptions = {
      propertyKey: propertyKey.toString(),
      ...options
    };

    Reflect.defineMetadata('jackson:JsonBackReference', privateOptions, target.constructor, propertyKey);
    Reflect.defineMetadata('jackson:JsonBackReference:' + privateOptions.value, privateOptions, target.constructor);
    Reflect.defineMetadata('jackson:JsonBackReference:' + propertyKey.toString(), privateOptions, target.constructor);
  });
