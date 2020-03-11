import {makeDecorator, isClass} from '../util';
import "reflect-metadata";
import {JsonRootNameOptions} from "../@types";

export interface JsonRootNameDecorator {
  (options?: JsonRootNameOptions): any;
}

export const JsonRootName: JsonRootNameDecorator = makeDecorator(
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