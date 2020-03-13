import {isClass, makeDecorator} from '../util';
import "reflect-metadata";
import {JsonIdentityInfoOptions} from "../@types";

export interface JsonIdentityInfoDecorator {
  (options: JsonIdentityInfoOptions): any;
}

export const JsonIdentityInfo: JsonIdentityInfoDecorator = makeDecorator(
  (o: JsonIdentityInfoOptions): JsonIdentityInfoOptions => (
    {
      property: '@id',
      ...o
    }),
  (options: JsonIdentityInfoOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonIdentityInfo", options, target);
      return target;
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });