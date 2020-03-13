import {makeDecorator, isClass} from '../util';
import "reflect-metadata";
import {JsonPropertyOrderOptions} from "../@types";

export interface JsonPropertyOrderDecorator {
  (options?: JsonPropertyOrderOptions): any;
}

export const JsonPropertyOrder: JsonPropertyOrderDecorator = makeDecorator(
  (o: JsonPropertyOrderOptions): JsonPropertyOrderOptions => ({alphabetic: false, value: [], ...o}),
  (options: JsonPropertyOrderOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonPropertyOrder", options, target);
      return target;
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });