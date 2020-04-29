/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonSerializeDecorator } from '../@types';
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
export declare const JsonSerialize: JsonSerializeDecorator;
