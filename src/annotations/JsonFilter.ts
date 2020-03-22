import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {
  JsonFilterOptions
} from '../@types';

export enum JsonFilterType {
  SERIALIZE_ALL,
  SERIALIZE_ALL_EXCEPT,
  FILTER_OUT_ALL_EXCEPT
}

export type JsonFilterDecorator = (options: JsonFilterOptions) => any;

export const JsonFilter: JsonFilterDecorator = makeJacksonDecorator(
  (o: JsonFilterOptions): JsonFilterOptions => ({enabled: true, ...o }),
  (options: JsonFilterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      Reflect.defineMetadata('jackson:JsonFilter', options, target, propertyKey);
    } else if (typeof descriptorOrParamIndex !== 'number' && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonFilter', options, target);
      Reflect.defineMetadata('jackson:JsonFilter', options, target.constructor);
      return target;
    }
  });
