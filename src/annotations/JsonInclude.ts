import {makeJacksonDecorator, isClass} from '../util';
import 'reflect-metadata';
import {JsonIncludeDecorator, JsonIncludeOptions} from '../@types';

export enum JsonIncludeType {
  ALWAYS,
  NON_EMPTY,
  NON_NULL
}

export const JsonInclude: JsonIncludeDecorator = makeJacksonDecorator(
  (o: JsonIncludeOptions): JsonIncludeOptions => ({enabled: true, value: JsonIncludeType.ALWAYS, ...o}),
  (options: JsonIncludeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonInclude', options, target);
      return target;
    } else if (propertyKey) {
      Reflect.defineMetadata('jackson:JsonInclude', options, target, propertyKey);
    }
  });
