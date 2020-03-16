import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonAnySetterOptions} from '../@types';
import {JacksonError} from '../core/JacksonError';

export interface JsonAnySetterPrivateOptions extends JsonAnySetterOptions {
  propertyKey: string;
}

export type JsonAnySetterDecorator = (options?: JsonAnySetterOptions) => any;

export const JsonAnySetter: JsonAnySetterDecorator = makeJacksonDecorator(
  (o: JsonAnySetterOptions): JsonAnySetterOptions => ({enabled: true, ...o}),
  (options: JsonAnySetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      const privateOptions: JsonAnySetterPrivateOptions = {
        propertyKey: propertyKey.toString(),
        ...options
      };
      if (Reflect.hasMetadata('jackson:JsonAnySetter', target)) {
        throw new JacksonError(`Multiple 'any-setters' defined for "${target.constructor.name}".`);
      }
      Reflect.defineMetadata('jackson:JsonAnySetter', privateOptions, target);
    }
  });
