import {isClass, makeDecorator} from '../util';
import "reflect-metadata";
import {JsonTypeNameOptions} from "../@types";

export interface JsonTypeNameDecorator {
  (options?: JsonTypeNameOptions): any;
}

export const JsonTypeName: JsonTypeNameDecorator = makeDecorator(
  (o: JsonTypeNameOptions): JsonTypeNameOptions => o,
  (options: JsonTypeNameOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (options.value && options.value.trim() !== "" && !descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonTypeName", options.value, target);
      Reflect.defineMetadata("jackson:JsonTypeName:" + options.value, target, target);
      Reflect.defineMetadata("jackson:JsonTypeName:" + (target as ObjectConstructor).name, target, target);
      return target;
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });
