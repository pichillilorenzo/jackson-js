import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonManagedReferenceOptions} from '../@types';

export type JsonManagedReferenceDecorator = (options?: JsonManagedReferenceOptions) => any;

export const JsonManagedReference: JsonManagedReferenceDecorator = makeJacksonDecorator(
  (o: JsonManagedReferenceOptions = {}): JsonManagedReferenceOptions => ({enabled: true, ...o}),
  (options: JsonManagedReferenceOptions, target, propertyKey, descriptorOrParamIndex) => {
    Reflect.defineMetadata('jackson:JsonManagedReference', options, target.constructor, propertyKey);
    Reflect.defineMetadata('jackson:JsonManagedReference:' + propertyKey.toString(), options, target.constructor);
  });
