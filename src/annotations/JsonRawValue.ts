import {makeDecorator2} from '../util';
import "reflect-metadata";
import {JsonRawValueOptions} from "../@types";

export const JsonRawValue = makeDecorator2(
  (o: JsonRawValueOptions): JsonRawValueOptions => ({value: true, ...o}),
  (options: JsonRawValueOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.value)
      Reflect.defineMetadata("jackson:JsonRawValue", null, target.constructor, propertyKey);
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });