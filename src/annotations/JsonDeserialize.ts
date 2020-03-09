import {makeDecorator2} from '../util';
import "reflect-metadata";
import {JsonDeserializeOptions} from "../@types";

export const JsonDeserialize = makeDecorator2(
  (o: JsonDeserializeOptions = {}): JsonDeserializeOptions => o,
  (options: JsonDeserializeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.using)
      Reflect.defineMetadata("jackson:JsonDeserialize", options.using, target.constructor, propertyKey);
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });