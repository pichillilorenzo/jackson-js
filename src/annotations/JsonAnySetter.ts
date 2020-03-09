import {makeDecorator2} from '../util';
import "reflect-metadata";
import {JsonAnySetterOptions} from "../@types";

export const JsonAnySetter = makeDecorator2(
  (o: JsonAnySetterOptions): JsonAnySetterOptions => ({enabled: true, ...o}),
  (options: JsonAnySetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.enabled)
      Reflect.defineMetadata("jackson:JsonAnySetter", propertyKey, target);
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });
