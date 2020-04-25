/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
import {JsonSerializeDecorator, JsonSerializeOptions} from '../@types';

/**
 * Decorator used to indicates the use of a custom serializer.
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
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonSerialize({using: DateSerializer.serializeDate})
 *   @JsonDeserialize({using: DateSerializer.deserializeDate})
 *   @JsonClass({class: () => [Date]})
 *   date: Date;
 * }
 * ```
 */
export const JsonSerialize: JsonSerializeDecorator = makeJacksonDecorator(
  (o: JsonSerializeOptions): JsonSerializeOptions => ({enabled: true, ...o}),
  (options: JsonSerializeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (descriptorOrParamIndex == null && propertyKey == null) {
      defineMetadata('JsonSerialize', options, target);
      return target;
    }
    if (propertyKey != null) {
      defineMetadata('JsonSerialize', options, target.constructor, propertyKey);
    }
  });
