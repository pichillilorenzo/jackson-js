import {makeJacksonDecorator, isClass} from '../util';
import 'reflect-metadata';
import {JsonPropertyOrderOptions} from '../@types';

export type JsonPropertyOrderDecorator = (options?: JsonPropertyOrderOptions) => any;

export const JsonPropertyOrder: JsonPropertyOrderDecorator = makeJacksonDecorator(
  (o: JsonPropertyOrderOptions): JsonPropertyOrderOptions => ({
    enabled: true,
    alphabetic: false,
    value: [],
    ...o
  }),
  (options: JsonPropertyOrderOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonPropertyOrder', options, target);
      return target;
    }
  });
