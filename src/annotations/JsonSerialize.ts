import {makeDecorator2} from '../util';
import "reflect-metadata";
import {JsonSerializeOptions} from "../@types";

export const JsonSerialize = makeDecorator2(
  (o: JsonSerializeOptions = {}): JsonSerializeOptions => o,
  (options: JsonSerializeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.using)
      Reflect.defineMetadata("jackson:JsonSerialize", options.using, target, propertyKey);
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });
