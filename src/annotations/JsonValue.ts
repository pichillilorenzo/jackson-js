import {makeJacksonDecorator} from '../util';
import "reflect-metadata";
import {JsonValueOptions} from "../@types";

export interface JsonValueDecorator {
  (options?: JsonValueOptions): any;
}

export const JsonValue: JsonValueDecorator = makeJacksonDecorator(
  (o: JsonValueOptions): JsonValueOptions => ({enabled: true, ...o}),
  (options: JsonValueOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (typeof descriptorOrParamIndex !== "number") {
      Reflect.defineMetadata("jackson:JsonValue", propertyKey, target);
    }
  });
