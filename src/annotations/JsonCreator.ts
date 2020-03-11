import {isClass, makeDecorator} from '../util';
import "reflect-metadata";
import {JsonCreatorOptions} from "../@types";

export interface JsonCreatorPrivateOptions extends JsonCreatorOptions {
  constructor?: Object | ObjectConstructor,
  method?: Function
}

export interface JsonCreatorDecorator {
  (options?: JsonCreatorOptions): any;
}

export const JsonCreator: JsonCreatorDecorator = makeDecorator(
  (o: JsonCreatorOptions = {}): JsonCreatorOptions => o,
  (options: JsonCreatorOptions, target, propertyKey, descriptor) => {
    const additionalOptions: JsonCreatorPrivateOptions = {
      constructor: null,
      method: null,
      ...options
    };
    descriptor = descriptor as TypedPropertyDescriptor<any>;
    if (descriptor && typeof descriptor.value === "function") {
      additionalOptions.method = descriptor.value;
      Reflect.defineMetadata("jackson:JsonCreator", additionalOptions, target);
      Reflect.defineMetadata("jackson:JsonCreator:" + propertyKey.toString(), additionalOptions, target, propertyKey);
    }
    else if (!descriptor && isClass(target)) {
      additionalOptions.constructor = target;
      // get original constructor
      while(additionalOptions.constructor.toString().trim().startsWith("class extends target {"))
        additionalOptions.constructor = Object.getPrototypeOf(additionalOptions.constructor)

      Reflect.defineMetadata("jackson:JsonCreator", additionalOptions, target);
      return target;
    }
    return descriptor;
  });