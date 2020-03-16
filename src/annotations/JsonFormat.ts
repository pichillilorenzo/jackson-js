import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonFormatOptions} from '../@types';

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

export type JsonFormatDecorator = (options?: JsonFormatOptions) => any;

export const JsonFormat: JsonFormatDecorator = makeJacksonDecorator(
  (o: JsonFormatOptions): JsonFormatOptions => (
    {
      enabled: true,
      shape: JsonFormatShape.ANY,
      locale: 'en-US',
      ...o
    }),
  (options: JsonFormatOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      Reflect.defineMetadata('jackson:JsonFormat', options, target, propertyKey);
    }
  });
