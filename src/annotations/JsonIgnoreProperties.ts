import {isClass, makeDecorator} from '../util';
import "reflect-metadata";
import {JsonIgnorePropertiesOptions} from "../@types";

export interface JsonIgnorePropertiesDecorator {
  (options?: JsonIgnorePropertiesOptions): any;
}

export const JsonIgnoreProperties: JsonIgnorePropertiesDecorator = makeDecorator(
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