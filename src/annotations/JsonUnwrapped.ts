import {makeDecorator} from '../util';
import "reflect-metadata";
import {JsonUnwrappedOptions} from "../@types";

export interface JsonUnwrappedDecorator {
  (options?: JsonUnwrappedOptions): any;
}

export const JsonUnwrapped: JsonUnwrappedDecorator = makeDecorator(
  (o: JsonUnwrappedOptions): JsonUnwrappedOptions => ({enabled: true, ...o}),
  (options: JsonUnwrappedOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (typeof descriptorOrParamIndex !== "number" && options.enabled) {
      Reflect.defineMetadata("jackson:JsonUnwrapped", options, target, propertyKey);
      Reflect.defineMetadata("jackson:JsonUnwrapped:" + propertyKey.toString(), options, target);
      Reflect.defineMetadata("jackson:JsonUnwrapped:" + propertyKey.toString(), options, target.constructor);
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });
