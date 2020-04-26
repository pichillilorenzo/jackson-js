/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
import {JsonClassTypeDecorator, JsonClassTypeOptions} from '../@types';

/**
 * Decorator used to define the type of a class property or method parameter.
 * Used during serialization and, more important, during deserialization to know about the type of a property/parameter.
 *
 * This is necessary because JavaScript isn't a strong typed programming language,
 * so, for example, during deserialization, without the usage of this decorator, there isn't any way to know
 * the specific type of a class property, such as a `Date` or a custom Class type.
 *
 * @example
 * ```typescript
 * class Book {
 *   @JsonProperty()
 *   @JsonClassType({type: () => [String]})
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonClassType({type: () => [String]})
 *   category: string;
 * }
 *
 * class Writer {
 *   @JsonProperty()
 *   @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty()
 *   @JsonClassType({type: () => [String]})
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonClassType({type: () => [Array, [Book]]})
 *   books: Book[] = [];
 * }
 * ```
 */
export const JsonClassType: JsonClassTypeDecorator = makeJacksonDecorator(
  (o: JsonClassTypeOptions): JsonClassTypeOptions => ({enabled: true, ...o}),
  (options: JsonClassTypeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      defineMetadata(
        'JsonClassTypeParam',
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor', {
          suffix: descriptorOrParamIndex.toString()
        });
    }
    if (propertyKey != null) {
      defineMetadata('JsonClassType', options, target.constructor, propertyKey);
      defineMetadata('JsonClassType', options, target.constructor, null, {
        suffix: propertyKey.toString()
      });
    }
  });
