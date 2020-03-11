import {makeDecorator} from '../util';
import "reflect-metadata";
import {JsonAliasOptions} from "../@types";

export interface JsonAliasDecorator {
  (options?: JsonAliasOptions): any;
}

export const JsonAlias: JsonAliasDecorator = makeDecorator(
  (o: JsonAliasOptions): JsonAliasOptions => o,
  (options: JsonAliasOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (typeof descriptorOrParamIndex !== "number" && options.values && options.values.length > 0) {
      Reflect.defineMetadata("jackson:JsonAlias", options, target, propertyKey);
      Reflect.defineMetadata("jackson:JsonAlias:" + propertyKey.toString(), options, target.constructor);
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });
