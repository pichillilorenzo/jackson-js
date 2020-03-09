import {makeDecorator2} from '../util';
import "reflect-metadata";
import {JsonBackReferenceOptions} from "../@types";

export const JsonBackReference = makeDecorator2(
  (o: JsonBackReferenceOptions = {}): JsonBackReferenceOptions => o,
  (options: JsonBackReferenceOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (options.class != null) {
      Reflect.defineMetadata("jackson:JsonBackReference", options, target.constructor, propertyKey);
      Reflect.defineMetadata("jackson:JsonBackReference:" + propertyKey.toString(), options, target.constructor);
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });