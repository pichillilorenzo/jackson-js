import {makeDecorator, isClass} from '../util';
import "reflect-metadata";
import {JsonIgnoreTypeOptions} from "../@types";

export interface JsonIgnoreTypeDecorator {
  (options?: JsonIgnoreTypeOptions): any;
}

export const JsonIgnoreType: JsonIgnoreTypeDecorator = makeDecorator(
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