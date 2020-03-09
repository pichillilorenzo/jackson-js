import {makeDecorator2, isClass} from '../util';
import "reflect-metadata";
import {JsonIgnoreTypeOptions} from "../@types";

export const JsonIgnoreType = makeDecorator2(
  (o: JsonIgnoreTypeOptions): JsonIgnoreTypeOptions => ({value: true, ...o}),
  (options: JsonIgnoreTypeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (options.value && !descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonIgnoreType", null, target);
      return target;
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });