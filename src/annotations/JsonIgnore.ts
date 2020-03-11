import {makeDecorator} from '../util';
import "reflect-metadata";
import {JsonIgnoreOptions} from "../@types";

export interface JsonIgnoreDecorator {
  (options?: JsonIgnoreOptions): any;
}

export const JsonIgnore: JsonIgnoreDecorator = makeDecorator(
  (o: JsonIgnoreOptions): JsonIgnoreOptions => ({value: true, ...o}),
  (options: JsonIgnoreOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.value)
      Reflect.defineMetadata("jackson:JsonIgnore", null, target.constructor, propertyKey);
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });
