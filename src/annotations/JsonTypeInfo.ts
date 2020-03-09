import {isClass, makeDecorator2} from '../util';
import "reflect-metadata";
import {JsonTypeInfoOptions} from "../@types";

export enum JsonTypeInfoId {
  CLASS = 0,
  NAME = 1,
}

export enum JsonTypeInfoAs {
  PROPERTY = 0,
  WRAPPER_OBJECT = 1,
  WRAPPER_ARRAY = 2
}

export const JsonTypeInfo = makeDecorator2(
  (o: JsonTypeInfoOptions): JsonTypeInfoOptions => (
    {
      use: JsonTypeInfoId.CLASS,
      include: JsonTypeInfoAs.PROPERTY,
      property: '@type',
      ...o
    }),
  (options: JsonTypeInfoOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonTypeInfo", options, target);
      return target;
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });