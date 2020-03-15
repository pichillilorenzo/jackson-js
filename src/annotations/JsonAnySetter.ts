import {makeJacksonDecorator} from '../util';
import "reflect-metadata";
import {JsonAnySetterOptions} from "../@types";

export interface JsonAnySetterDecorator {
  (options?: JsonAnySetterOptions): any;
}

export const JsonAnySetter: JsonAnySetterDecorator = makeJacksonDecorator(
  (o: JsonAnySetterOptions): JsonAnySetterOptions => ({enabled: true, ...o}),
  (options: JsonAnySetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      Reflect.defineMetadata("jackson:JsonAnySetter", propertyKey, target);
    }
  });
