import {makeDecorator} from '../util';
import "reflect-metadata";
import {JsonDeserializeOptions} from "../@types";

export interface JsonDeserializeDecorator {
  (options?: JsonDeserializeOptions): any;
}

export const JsonDeserialize: JsonDeserializeDecorator = makeDecorator(
  (o: JsonDeserializeOptions = {}): JsonDeserializeOptions => o,
  (options: JsonDeserializeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.using)
      Reflect.defineMetadata("jackson:JsonDeserialize", options.using, target.constructor, propertyKey);
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });