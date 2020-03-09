import {makeDecorator2} from '../util';
import "reflect-metadata";
import {JsonFormatOptions} from "../@types";

export enum JsonFormatShape {
  ANY = 0,
  ARRAY = 1,
  BOOLEAN = 2,
  NUMBER_FLOAT = 3,
  NUMBER_INT = 4,
  OBJECT = 5,
  SCALAR = 6,
  STRING = 7
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
