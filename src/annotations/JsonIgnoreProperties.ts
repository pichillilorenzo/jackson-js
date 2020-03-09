import {isClass, makeDecorator2} from '../util';
import "reflect-metadata";
import {JsonIgnorePropertiesOptions} from "../@types";

export const JsonIgnoreProperties = makeDecorator2(
  (o: JsonIgnorePropertiesOptions): JsonIgnorePropertiesOptions => (
    {
      allowGetters: false,
      allowSetters: false,
      ...o
    }),
  (options: JsonIgnorePropertiesOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonIgnoreProperties", options, target);
      return target;
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });