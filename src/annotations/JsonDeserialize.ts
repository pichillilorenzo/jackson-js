import {makeJacksonDecorator} from '../util';
import "reflect-metadata";
import {JsonDeserializeOptions} from "../@types";

export interface JsonDeserializeDecorator {
  (options?: JsonDeserializeOptions): any;
}

export const JsonDeserialize: JsonDeserializeDecorator = makeJacksonDecorator(
  (o: JsonDeserializeOptions = {}): JsonDeserializeOptions => ({enabled: true, ...o}),
  (options: JsonDeserializeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.using) {
      Reflect.defineMetadata("jackson:JsonDeserialize", options.using, target.constructor, propertyKey);
    }
  });