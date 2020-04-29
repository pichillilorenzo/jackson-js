/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
import {JsonDeserializeDecorator, JsonDeserializeOptions} from '../@types';

/**
 * Decorator used to indicates the use of a custom deserializer.
 *
 * @example
 * ```typescript
 * class DateSerializer {
 *   static serializeDate(date): any {
 *     return {
 *       year: date.getFullYear(),
 *       month: date.getMonth() + 1,
 *       day: date.getDate(),
 *       formatted: date.toLocaleDateString()
 *     };
 *   }
 *   static deserializeDate(dateObj): Date {
 *     return new Date(dateObj.formatted);
 *   }
 * }
 *
 * class Book {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonSerialize({using: DateSerializer.serializeDate})
 *   @JsonDeserialize({using: DateSerializer.deserializeDate})
 *   @JsonClassType({type: () => [Date]})
 *   date: Date;
 * }
 * ```
 */
export const JsonDeserialize: JsonDeserializeDecorator = makeJacksonDecorator(
  (o: JsonDeserializeOptions): JsonDeserializeOptions => ({enabled: true, ...o}),
  (options: JsonDeserializeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (descriptorOrParamIndex == null && propertyKey == null) {
      defineMetadata('JsonDeserialize', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      defineMetadata(
        'JsonDeserializeParam',
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor', {
          suffix: descriptorOrParamIndex.toString()
        });
    }
    if (propertyKey != null) {
      defineMetadata('JsonDeserialize', options, target.constructor, propertyKey);
    }
  });
