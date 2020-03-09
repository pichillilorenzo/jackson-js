import {isClass, makeDecorator2} from '../util';
import "reflect-metadata";
import {JsonTypeNameOptions} from "../@types";

export const JsonTypeName = makeDecorator2(
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
