import {makeDecorator} from '../util';
import "reflect-metadata";
import {JsonAnyGetterOptions} from "../@types";

export interface JsonAnyGetterDecorator {
  (options?: JsonAnyGetterOptions): any;
}

export const JsonAnyGetter: JsonAnyGetterDecorator = makeDecorator(
  (o: JsonAnyGetterOptions): JsonAnyGetterOptions => ({enabled: true, ...o}),
  (options: JsonAnyGetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.enabled)
      Reflect.defineMetadata("jackson:JsonAnyGetter", propertyKey, target);
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });
