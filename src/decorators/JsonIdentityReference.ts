import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {
  JsonIdentityReferenceDecorator,
  JsonIdentityReferenceOptions
} from '../@types';

export const JsonIdentityReference: JsonIdentityReferenceDecorator = makeJacksonDecorator(
  (o: JsonIdentityReferenceOptions): JsonIdentityReferenceOptions => (
    {
      enabled: true,
      ...o
    }),
  (options: JsonIdentityReferenceOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonIdentityReference', options, target);
      return target;
    }
  });
