import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {
  JsonFilterDecorator,
  JsonFilterOptions
} from '../@types';

export enum JsonFilterType {
  SERIALIZE_ALL,
  SERIALIZE_ALL_EXCEPT,
  FILTER_OUT_ALL_EXCEPT
}

export const JsonFilter: JsonFilterDecorator = makeJacksonDecorator(
  (o: JsonFilterOptions): JsonFilterOptions => ({enabled: true, ...o }),
  (options: JsonFilterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      Reflect.defineMetadata('jackson:JsonFilter', options, target.constructor, propertyKey);
    } else if (typeof descriptorOrParamIndex !== 'number' && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonFilter', options, target);
      return target;
    }
  });
