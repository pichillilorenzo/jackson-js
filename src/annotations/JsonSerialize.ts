import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonSerializeDecorator, JsonSerializeOptions} from '../@types';

export const JsonSerialize: JsonSerializeDecorator = makeJacksonDecorator(
  (o: JsonSerializeOptions): JsonSerializeOptions => ({enabled: true, ...o}),
  (options: JsonSerializeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonSerialize', options, target, propertyKey);
    }
  });
