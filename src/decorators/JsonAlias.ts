/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
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
      defineMetadata('JsonAlias', options, target.constructor, propertyKey);
      defineMetadata('JsonAlias', options, target.constructor, null, {
        suffix: propertyKey.toString()
      });
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      defineMetadata('JsonAliasParam',
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor', {
          suffix: descriptorOrParamIndex.toString()
        });
    }
  });
