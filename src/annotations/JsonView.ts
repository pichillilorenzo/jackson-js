import {makeDecorator2} from '../util';
import "reflect-metadata";
import {JsonViewOptions} from "../@types";

export const JsonView = makeDecorator2(
  (o: JsonViewOptions = {}): JsonViewOptions => o,
  (options: JsonViewOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.value != null)
      Reflect.defineMetadata("jackson:JsonView", options, target.constructor, propertyKey);
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });

