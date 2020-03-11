import {makeDecorator, isClass} from '../util';
import "reflect-metadata";
import {JsonIncludeOptions} from "../@types";

export enum JsonIncludeType {
  ALWAYS,
  NON_EMPTY,
  NON_NULL
}

export interface JsonIncludeDecorator {
  (options?: JsonIncludeOptions): any;
}

export const JsonInclude: JsonIncludeDecorator = makeDecorator(
  (o: JsonIncludeOptions): JsonIncludeOptions => ({value: JsonIncludeType.ALWAYS, ...o}),
  (options: JsonIncludeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (options.value !== JsonIncludeType.ALWAYS) {
      if (!descriptorOrParamIndex && isClass(target)) {
        Reflect.defineMetadata("jackson:JsonInclude", options, target);
        return target;
      }
      else if (propertyKey)
        Reflect.defineMetadata("jackson:JsonInclude", options, target, propertyKey);
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });
