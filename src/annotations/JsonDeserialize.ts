import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonDeserializeDecorator, JsonDeserializeOptions} from '../@types';

export const JsonDeserialize: JsonDeserializeDecorator = makeJacksonDecorator(
  (o: JsonDeserializeOptions): JsonDeserializeOptions => ({enabled: true, ...o}),
  (options: JsonDeserializeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      Reflect.defineMetadata('jackson:JsonDeserialize', options, target.constructor, propertyKey);
    }
  });
