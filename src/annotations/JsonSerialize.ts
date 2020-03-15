import {makeJacksonDecorator} from '../util';
import "reflect-metadata";
import {JsonSerializeOptions} from "../@types";

export interface JsonSerializeDecorator {
  (options?: JsonSerializeOptions): any;
}

export const JsonSerialize: JsonSerializeDecorator = makeJacksonDecorator(
  (o: JsonSerializeOptions): JsonSerializeOptions => ({enabled: true, ...o}),
  (options: JsonSerializeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.using) {
      Reflect.defineMetadata("jackson:JsonSerialize", options.using, target, propertyKey);
    }
  });
