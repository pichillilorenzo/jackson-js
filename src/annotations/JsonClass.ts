import {makeDecorator} from '../util';
import "reflect-metadata";
import {JsonClassOptions} from "../@types";

export interface JsonClassDecorator {
  (options: JsonClassOptions): any;
}

export const JsonClass: JsonClassDecorator = makeDecorator(
  (o: JsonClassOptions): JsonClassOptions => ({isArray: false, ...o}),
  (options: JsonClassOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (options.class != null) {
      Reflect.defineMetadata("jackson:JsonClass", options, target, propertyKey);
      Reflect.defineMetadata("jackson:JsonClass", options, target.constructor, propertyKey);
      Reflect.defineMetadata("jackson:JsonClass:" + propertyKey.toString(), options, target.constructor);
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });