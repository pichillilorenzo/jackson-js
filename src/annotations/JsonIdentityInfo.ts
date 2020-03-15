import {isClass, makeJacksonDecorator} from '../util';
import "reflect-metadata";
import {
  JsonIdentityInfoOptions
} from "../@types";

export enum ObjectIdGenerator {
  IntSequenceGenerator,
  None,
  PropertyGenerator,
  UUIDv5Generator,
  UUIDv4Generator,
  UUIDv3Generator,
  UUIDv1Generator
}

export interface JsonIdentityInfoDecorator {
  (options: JsonIdentityInfoOptions): any;
}

export const JsonIdentityInfo: JsonIdentityInfoDecorator = makeJacksonDecorator(
  (o: JsonIdentityInfoOptions): JsonIdentityInfoOptions => (
    {
      enabled: true,
      property: '@id',
      uuidv5: {},
      uuidv4: {},
      uuidv3: {},
      uuidv1: {},
      ...o
    }),
  (options: JsonIdentityInfoOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonIdentityInfo", options, target);
      Reflect.defineMetadata("jackson:JsonIdentityInfo", options, target.constructor);
      return target;
    }
  });