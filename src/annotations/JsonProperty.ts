import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonPropertyOptions} from '../@types';

export enum JsonPropertyAccess {
  WRITE_ONLY,
  READ_ONLY,
  READ_WRITE,
  AUTO
}

export type JsonPropertyDecorator = (options?: JsonPropertyOptions) => any;

export const JsonProperty: JsonPropertyDecorator = makeJacksonDecorator(
  (o: JsonPropertyOptions = {}): JsonPropertyOptions => ({
    enabled: true,
    required: false,
    access: JsonPropertyAccess.AUTO,
    ...o
  }),
  (options: JsonPropertyOptions, target, propertyKey, descriptorOrParamIndex) => {
    options.defaultValue = (options.defaultValue) ? options.defaultValue : propertyKey;
    options.value = (options.value) ? options.value : options.defaultValue;
    Reflect.defineMetadata('jackson:JsonProperty', options, target, propertyKey);
    Reflect.defineMetadata('jackson:JsonProperty:' + propertyKey.toString(), options, target.constructor);
    Reflect.defineMetadata('jackson:JsonProperty:reverse:' + options.value, propertyKey, target.constructor);
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      Reflect.defineMetadata('jackson:JsonPropertyParam:' + descriptorOrParamIndex.toString(), options, target);
    }
  });
