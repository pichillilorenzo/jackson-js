import {makeDecorator2} from '../util';
import "reflect-metadata";
import {JsonPropertyOptions} from "../@types";

export const JsonProperty = makeDecorator2(
  (o: JsonPropertyOptions = {}): JsonPropertyOptions => o,
  (options: JsonPropertyOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (descriptorOrParamIndex != null) {
      options.defaultValue = (options.defaultValue) ? options.defaultValue : propertyKey;
      options.value = (options.value) ? options.value : options.defaultValue;
      Reflect.defineMetadata("jackson:JsonProperty", options, target, propertyKey);
      Reflect.defineMetadata("jackson:JsonProperty:" + propertyKey.toString(), options, target.constructor);
      Reflect.defineMetadata("jackson:JsonProperty:reverse:" + options.value, propertyKey, target.constructor);
      if (typeof descriptorOrParamIndex === "number") {
        Reflect.defineMetadata("jackson:JsonPropertyParam:" + descriptorOrParamIndex.toString(), options, target);
      }
    }
    if (typeof descriptorOrParamIndex !== "number") {
      return descriptorOrParamIndex;
    }
  });