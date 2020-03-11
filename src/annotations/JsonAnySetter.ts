import {makeDecorator} from '../util';
import "reflect-metadata";
import {JsonAnySetterOptions} from "../@types";

export interface JsonAnySetterDecorator {
  (options?: JsonAnySetterOptions): any;
}

export const JsonAnySetter: JsonAnySetterDecorator = makeDecorator(
  (o: JsonAnySetterOptions): JsonAnySetterOptions => ({enabled: true, ...o}),
  (options: JsonAnySetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.enabled)
      Reflect.defineMetadata("jackson:JsonAnySetter", propertyKey, target);
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });
