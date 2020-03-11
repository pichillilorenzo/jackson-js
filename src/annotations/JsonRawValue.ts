import {makeDecorator} from '../util';
import "reflect-metadata";
import {JsonRawValueOptions} from "../@types";

export interface JsonRawValueDecorator {
  (options?: JsonRawValueOptions): any;
}

export const JsonRawValue: JsonRawValueDecorator = makeDecorator(
  (o: JsonRawValueOptions): JsonRawValueOptions => ({value: true, ...o}),
  (options: JsonRawValueOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.value)
      Reflect.defineMetadata("jackson:JsonRawValue", null, target.constructor, propertyKey);
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });