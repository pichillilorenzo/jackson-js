/**
 * @packageDocumentation
 * @module Decorators
 */

import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
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
    if (descriptorOrParamIndex == null && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonSerialize', options, target);
      return target;
    }
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonSerialize', options, target.constructor, propertyKey);
    }
  });
