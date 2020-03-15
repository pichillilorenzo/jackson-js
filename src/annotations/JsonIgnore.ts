import {makeJacksonDecorator} from '../util';
import "reflect-metadata";
import {JsonIgnoreOptions} from "../@types";

export interface JsonIgnoreDecorator {
  (options?: JsonIgnoreOptions): any;
}

export const JsonIgnore: JsonIgnoreDecorator = makeJacksonDecorator(
  (o: JsonIgnoreOptions): JsonIgnoreOptions => ({enabled: true, ...o}),
  (options: JsonIgnoreOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      Reflect.defineMetadata("jackson:JsonIgnore", null, target.constructor, propertyKey);
    }
  });
