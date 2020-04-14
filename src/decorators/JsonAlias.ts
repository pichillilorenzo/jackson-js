/**
 * @packageDocumentation
 * @module Decorators
 */

import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonAliasDecorator, JsonAliasOptions} from '../@types';

/**
 * Decorator that can be used to define one or more alternative names for a property,
 * accepted during deserialization as alternative to the official name.
 * Has no effect during serialization where primary name is always used.
 *
 * @example
 * ```typescript
 * class Book {
 *   @JsonProperty()
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonAlias({values: ['bkcat', 'mybkcat']})
 *   category: string;
 *
 *   constructor(name: string, category: string) {
 *     this.name = name;
 *     this.category = category;
 *   }
 * }
 * ```
 */
export const JsonAlias: JsonAliasDecorator = makeJacksonDecorator(
  (o: JsonAliasOptions): JsonAliasOptions => ({enabled: true, ...o}),
  (options: JsonAliasOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonAlias', options, target.constructor, propertyKey);
      Reflect.defineMetadata('jackson:JsonAlias:' + propertyKey.toString(), options, target.constructor);
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      Reflect.defineMetadata('jackson:JsonAliasParam:' + descriptorOrParamIndex.toString(),
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor');
    }
  });
