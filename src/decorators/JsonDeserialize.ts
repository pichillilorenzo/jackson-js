/**
 * @packageDocumentation
 * @module Decorators
 */

import {getArgumentNames, isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
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
export const JsonDeserialize: JsonDeserializeDecorator = makeJacksonDecorator(
  (o: JsonDeserializeOptions): JsonDeserializeOptions => ({enabled: true, ...o}),
  (options: JsonDeserializeOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonDeserialize', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      Reflect.defineMetadata(
        'jackson:JsonDeserializeParam:' + descriptorOrParamIndex.toString(),
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor');
    }
    if (propertyKey) {
      Reflect.defineMetadata('jackson:JsonDeserialize', options, target.constructor, propertyKey);
    }
  });
