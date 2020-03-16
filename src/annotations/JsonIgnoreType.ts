import {makeJacksonDecorator, isClass} from '../util';
import 'reflect-metadata';
import {JsonIgnoreTypeOptions} from '../@types';

export type JsonIgnoreTypeDecorator = (options?: JsonIgnoreTypeOptions) => any;

export const JsonIgnoreType: JsonIgnoreTypeDecorator = makeJacksonDecorator(
  (o: JsonIgnoreTypeOptions): JsonIgnoreTypeOptions => ({enabled: true, ...o}),
  (options: JsonIgnoreTypeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonIgnoreType', null, target);
      return target;
    }
  });
