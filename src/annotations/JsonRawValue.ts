import {makeJacksonDecorator} from '../util';
import "reflect-metadata";
import {JsonRawValueOptions} from "../@types";

export interface JsonRawValueDecorator {
  (options?: JsonRawValueOptions): any;
}

export const JsonRawValue: JsonRawValueDecorator = makeJacksonDecorator(
  (o: JsonRawValueOptions): JsonRawValueOptions => ({enabled: true, ...o}),
  (options: JsonRawValueOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      Reflect.defineMetadata("jackson:JsonRawValue", null, target.constructor, propertyKey);
    }
  });