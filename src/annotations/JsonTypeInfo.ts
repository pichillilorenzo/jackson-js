import {isClass, makeJacksonDecorator} from '../util';
import "reflect-metadata";
import {JsonTypeInfoOptions} from "../@types";

export enum JsonTypeInfoId {
  NAME
}

export enum JsonTypeInfoAs {
  PROPERTY,
  WRAPPER_OBJECT,
  WRAPPER_ARRAY
}

export interface JsonTypeInfoDecorator {
  (options: JsonTypeInfoOptions): any;
}

export const JsonTypeInfo: JsonTypeInfoDecorator = makeJacksonDecorator(
  (o: JsonTypeInfoOptions): JsonTypeInfoOptions => (
    {
      enabled: true,
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.PROPERTY,
      property: '@type',
      ...o
    }),
  (options: JsonTypeInfoOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonTypeInfo", options, target);
      return target;
    }
  });