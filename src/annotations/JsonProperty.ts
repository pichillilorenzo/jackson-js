import {getArgumentNames, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonPropertyDecorator, JsonPropertyOptions} from '../@types';

export enum JsonPropertyAccess {
  WRITE_ONLY,
  READ_ONLY,
  READ_WRITE,
  AUTO
}

export const JsonProperty: JsonPropertyDecorator = makeJacksonDecorator(
  (o: JsonPropertyOptions = {}): JsonPropertyOptions => ({
    enabled: true,
    required: false,
    access: JsonPropertyAccess.AUTO,
    ...o
  }),
  (options: JsonPropertyOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      options.value = (options.value) ? options.value : propertyKey.toString();
    }

    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      if (!options.value) {
        const argNames = getArgumentNames(target);
        options.value = argNames[descriptorOrParamIndex];
      }
      Reflect.defineMetadata(
        'jackson:JsonPropertyParam:' + descriptorOrParamIndex.toString(),
        options, target, (propertyKey) ? propertyKey : 'constructor');
    }

    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonProperty', options, target.constructor, propertyKey);
      Reflect.defineMetadata('jackson:JsonProperty:' + propertyKey.toString(), options, target.constructor);
    }
  });
