import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonViewDecorator, JsonViewOptions} from '../@types';

export const JsonView: JsonViewDecorator = makeJacksonDecorator(
  (o: JsonViewOptions = {}): JsonViewOptions => ({enabled: true, ...o}),
  (options: JsonViewOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      Reflect.defineMetadata('jackson:JsonView', options, target.constructor, propertyKey);
    }
  });

