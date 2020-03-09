import {makeDecorator2, isClass} from '../util';
import "reflect-metadata";
import {JsonPropertyOrderOptions} from "../@types";

export const JsonPropertyOrder = makeDecorator2(
  (o: JsonPropertyOrderOptions): JsonPropertyOrderOptions => ({alphabetic: false, ...o}),
  (options: JsonPropertyOrderOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonPropertyOrder", options, target);
      return target;
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });