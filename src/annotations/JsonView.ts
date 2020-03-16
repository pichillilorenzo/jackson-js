import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonViewOptions} from '../@types';

export type JsonViewDecorator = (options?: JsonViewOptions) => any;

export const JsonView: JsonViewDecorator = makeJacksonDecorator(
  (o: JsonViewOptions = {}): JsonViewOptions => o,
  (options: JsonViewOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey && options.value != null) {
      Reflect.defineMetadata('jackson:JsonView', options, target.constructor, propertyKey);
    }
  });

