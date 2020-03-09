import {makeDecorator2} from '../util';
import "reflect-metadata";
import {JsonIgnoreOptions} from "../@types";

export const JsonIgnore = makeDecorator2(
  (o: JsonIgnoreOptions): JsonIgnoreOptions => ({value: true, ...o}),
  (options: JsonIgnoreOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.value)
      Reflect.defineMetadata("jackson:JsonIgnore", null, target.constructor, propertyKey);
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });
