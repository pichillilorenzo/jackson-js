import {makeDecorator2} from '../util';
import "reflect-metadata";
import {JsonAnyGetterOptions} from "../@types";

export const JsonAnyGetter = makeDecorator2(
  (o: JsonAnyGetterOptions): JsonAnyGetterOptions => ({enabled: true, ...o}),
  (options: JsonAnyGetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.enabled)
      Reflect.defineMetadata("jackson:JsonAnyGetter", propertyKey, target);
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });
