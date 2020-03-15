import {makeJacksonDecorator, isClass} from '../util';
import "reflect-metadata";
import {JsonRootNameOptions} from "../@types";

export interface JsonRootNameDecorator {
  (options?: JsonRootNameOptions): any;
}

export const JsonRootName: JsonRootNameDecorator = makeJacksonDecorator(
  (o: JsonRootNameOptions = {}): JsonRootNameOptions => ({enabled: true, ...o}),
  (options: JsonRootNameOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonRootName", options.value || (target as ObjectConstructor).name, target);
      return target;
    }
  });