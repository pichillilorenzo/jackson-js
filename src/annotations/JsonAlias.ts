import {getArgumentNames, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonAliasDecorator, JsonAliasOptions} from '../@types';

export const JsonAlias: JsonAliasDecorator = makeJacksonDecorator(
  (o: JsonAliasOptions): JsonAliasOptions => ({enabled: true, ...o}),
  (options: JsonAliasOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      Reflect.defineMetadata('jackson:JsonAlias', options, target, propertyKey);
      Reflect.defineMetadata('jackson:JsonAlias:' + propertyKey.toString(), options, target.constructor);
    }
    if (typeof descriptorOrParamIndex === 'number') {
      Reflect.defineMetadata('jackson:JsonAliasParam:' + descriptorOrParamIndex.toString(), options, target);
    }
  });
