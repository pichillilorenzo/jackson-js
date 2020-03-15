import {makeJacksonDecorator} from '../util';
import "reflect-metadata";
import {JsonBackReferenceOptions} from "../@types";

export interface JsonBackReferenceDecorator {
  (options?: JsonBackReferenceOptions): any;
}

export const JsonBackReference: JsonBackReferenceDecorator = makeJacksonDecorator(
  (o: JsonBackReferenceOptions = {}): JsonBackReferenceOptions => ({enabled: true, ...o}),
  (options: JsonBackReferenceOptions, target, propertyKey, descriptorOrParamIndex) => {
    Reflect.defineMetadata("jackson:JsonBackReference", options, target.constructor, propertyKey);
    Reflect.defineMetadata("jackson:JsonBackReference:" + propertyKey.toString(), options, target.constructor);
  });