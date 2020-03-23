import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonFormatDecorator, JsonFormatOptions} from '../@types';

export enum JsonFormatShape {
  ANY,
  ARRAY,
  BOOLEAN,
  NUMBER_FLOAT,
  NUMBER_INT,
  OBJECT,
  SCALAR,
  STRING
}

export const JsonFormat: JsonFormatDecorator = makeJacksonDecorator(
  (o: JsonFormatOptions): JsonFormatOptions => (
    {
      enabled: true,
      shape: JsonFormatShape.ANY,
      // @ts-ignore
      locale: 'en-US',
      ...o
    }),
  (options: JsonFormatOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      Reflect.defineMetadata('jackson:JsonFormat', options, target, propertyKey);
    } else if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonFormat', options, target);
      return target;
    }
  });
