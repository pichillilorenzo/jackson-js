import {isClass, makeJacksonDecorator} from '../util';
import "reflect-metadata";
import {JsonCreatorOptions} from "../@types";

export interface JsonCreatorPrivateOptions extends JsonCreatorOptions {
  constructor?: Object | ObjectConstructor,
  method?: Function
}

export interface JsonCreatorDecorator {
  (options?: JsonCreatorOptions): any;
}

export const JsonCreator: JsonCreatorDecorator = makeJacksonDecorator(
  (o: JsonCreatorOptions = {}): JsonCreatorOptions => ({enabled: true, ...o}),
  (options: JsonCreatorOptions, target, propertyKey, descriptorOrParamIndex) => {
    const additionalOptions: JsonCreatorPrivateOptions = {
      constructor: null,
      method: null,
      ...options
    };
    if (descriptorOrParamIndex && typeof descriptorOrParamIndex !== "number" && typeof descriptorOrParamIndex.value === "function") {
      additionalOptions.method = descriptorOrParamIndex.value;
      Reflect.defineMetadata("jackson:JsonCreator", additionalOptions, target);
      Reflect.defineMetadata("jackson:JsonCreator:" + propertyKey.toString(), additionalOptions, target, propertyKey);
    }
    else if (!descriptorOrParamIndex && isClass(target)) {
      additionalOptions.constructor = target;
      // get original constructor
      while(additionalOptions.constructor.toString().trim().startsWith("class extends target {")) {
        additionalOptions.constructor = Object.getPrototypeOf(additionalOptions.constructor);
      }

      Reflect.defineMetadata("jackson:JsonCreator", additionalOptions, target);
      return target;
    }
  });