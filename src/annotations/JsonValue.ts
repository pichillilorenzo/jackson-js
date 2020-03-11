import {makeDecorator} from '../util';
import "reflect-metadata";
import {JsonValueOptions} from "../@types";

export interface JsonValueDecorator {
  (options?: JsonValueOptions): any;
}

export const JsonValue: JsonValueDecorator = makeDecorator(
  (o: JsonValueOptions): JsonValueOptions => ({enabled: true, ...o}),
  (options: JsonValueOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (typeof descriptorOrParamIndex !== "number" && options.enabled) {
      Reflect.defineMetadata("jackson:JsonValue", propertyKey, target);
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });
