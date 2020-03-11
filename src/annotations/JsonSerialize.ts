import {makeDecorator} from '../util';
import "reflect-metadata";
import {JsonSerializeOptions} from "../@types";

export interface JsonSerializeDecorator {
  (options?: JsonSerializeOptions): any;
}

export const JsonSerialize: JsonSerializeDecorator = makeDecorator(
  (o: JsonSerializeOptions = {}): JsonSerializeOptions => o,
  (options: JsonSerializeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.using)
      Reflect.defineMetadata("jackson:JsonSerialize", options.using, target, propertyKey);
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });
