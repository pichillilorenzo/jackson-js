import {makeDecorator, isClass} from '../util';
import "reflect-metadata";
import {JsonSubTypesOptions} from "../@types";

export interface JsonSubTypesDecorator {
  (options: JsonSubTypesOptions): any;
}

export const JsonSubTypes: JsonSubTypesDecorator = makeDecorator(
  (o: JsonSubTypesOptions): JsonSubTypesOptions => o,
  (options: JsonSubTypesOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (options.types && options.types.length > 0 && !descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonSubTypes", options.types, target);
      return target;
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });
