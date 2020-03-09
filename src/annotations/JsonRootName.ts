import {makeDecorator2, isClass} from '../util';
import "reflect-metadata";
import {JsonRootNameOptions} from "../@types";

export const JsonRootName = makeDecorator2(
  (o: JsonRootNameOptions = {}): JsonRootNameOptions => o,
  (options: JsonRootNameOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonRootName", options.value || (target as ObjectConstructor).name, target);
      return target;
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });