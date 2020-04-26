/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
import {JsonFormatDecorator, JsonFormatOptions} from '../@types';

/**
 * Value enumeration used for indicating preferred Shape; translates loosely to JSON types.
 */
export enum JsonFormatShape {
  /**
   * Marker enum value that indicates "whatever" choice, meaning that decorator does NOT specify shape to use.
   */
  ANY,
  /**
   * Value that indicates that (JSON) Array type should be used.
   */
  ARRAY,
  /**
   * Value that indicates that (JSON) boolean type (true, false) should be used.
   */
  BOOLEAN,
  /**
   * Value that indicates that floating-point numeric type should be used.
   */
  NUMBER_FLOAT,
  /**
   * Value that indicates that integer number type should be used.
   */
  NUMBER_INT,
  /**
   * Value that indicates that (JSON) Object type should be used.
   */
  OBJECT,
  /**
   * Value that indicates shape should not be structural.
   */
  SCALAR,
  /**
   * Value that indicates that (JSON) String type should be used.
   */
  STRING
}

/**
 * General-purpose decorator used for configuring details of how values of properties are to be serialized.
 * This decorator does not have specific universal interpretation: instead, effect depends on datatype of property being decorated.
 *
 * Iterables, such as `Array` and `Set`, can be serialized as JSON Objects if {@link JsonFormatShape.OBJECT} is used.
 *
 * @example
 * ```typescript
 * class Event {
 *   @JsonProperty()
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonFormat({
 *     shape: JsonFormatShape.STRING,
 *     pattern: 'YYYY-MM-DD hh:mm:ss',
 *   })
 *   @JsonClassType({type: () => [Date]})
 *   startDate: Date;
 *
 *   @JsonProperty()
 *   @JsonFormat({
 *     shape: JsonFormatShape.STRING,
 *     toFixed: 2
 *   })
 *   @JsonDeserialize({using: (value: string) => parseFloat(value)})
 *   price: number;
 *
 *   @JsonProperty()
 *   @JsonFormat({
 *     shape: JsonFormatShape.BOOLEAN
 *   })
 *   @JsonDeserialize({using: (value: boolean) => value ? 1 : 0})
 *   canceled: number;
 *
 *   @JsonProperty()
 *   @JsonFormat({
 *     shape: JsonFormatShape.ARRAY
 *   })
 *   @JsonDeserialize({
 *     using: (value: string[]) => ({
 *       address: value[0],
 *       phone: value[1]
 *     })
 *   })
 *   info: {
 *     address: string;
 *     phone: string;
 *   };
 * }
 * ```
 */
export const JsonFormat: JsonFormatDecorator = makeJacksonDecorator(
  (o: JsonFormatOptions): JsonFormatOptions => (
    {
      enabled: true,
      shape: JsonFormatShape.ANY,
      // @ts-ignore
      locale: 'en',
      ...o
    }),
  (options: JsonFormatOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (descriptorOrParamIndex == null && propertyKey == null) {
      defineMetadata('JsonFormat', options, target);
      return target;
    }
    if (propertyKey != null) {
      defineMetadata('JsonFormat', options, target.constructor, propertyKey);
    }
  });
