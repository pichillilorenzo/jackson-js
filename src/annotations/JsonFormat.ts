import {makeDecorator2} from '../util';
import "reflect-metadata";
import {JsonFormatOptions} from "../@types";

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

export const JsonFormat = makeDecorator2(
  (o: JsonFormatOptions): JsonFormatOptions => (
    {
      shape: JsonFormatShape.ANY,
      locale: 'en-US',
      ...o
    }),
  (options: JsonFormatOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey)
      Reflect.defineMetadata("jackson:JsonFormat", options, target, propertyKey);
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });
