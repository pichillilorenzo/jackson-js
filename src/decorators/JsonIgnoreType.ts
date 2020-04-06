import {makeJacksonDecorator, isClass} from '../util';
import 'reflect-metadata';
import {JsonIgnoreTypeDecorator, JsonIgnoreTypeOptions} from '../@types';

export const JsonIgnoreType: JsonIgnoreTypeDecorator = makeJacksonDecorator(
  (o: JsonIgnoreTypeOptions): JsonIgnoreTypeOptions => ({enabled: true, ...o}),
  (options: JsonIgnoreTypeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonIgnoreType', options, target);
      return target;
    }
  });
