import {makeDecorator} from '../util';
import "reflect-metadata";
import {JsonManagedReferenceOptions} from "../@types";

export interface JsonManagedReferenceDecorator {
  (options?: JsonManagedReferenceOptions): any;
}

export const JsonManagedReference: JsonManagedReferenceDecorator = makeDecorator(
  (o: JsonManagedReferenceOptions = {}): JsonManagedReferenceOptions => o,
  (options: JsonManagedReferenceOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (options.class != null) {
      Reflect.defineMetadata("jackson:JsonManagedReference", options, target.constructor, propertyKey);
      Reflect.defineMetadata("jackson:JsonManagedReference:" + propertyKey.toString(), options, target.constructor);
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });