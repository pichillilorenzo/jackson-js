/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonFormatDecorator } from '../@types';
/**
 * Value enumeration used for indicating preferred Shape; translates loosely to JSON types.
 */
export declare enum JsonFormatShape {
    /**
     * Marker enum value that indicates "whatever" choice, meaning that decorator does NOT specify shape to use.
     */
    ANY = 0,
    /**
     * Value that indicates that (JSON) Array type should be used.
     */
    ARRAY = 1,
    /**
     * Value that indicates that (JSON) boolean type (true, false) should be used.
     */
    BOOLEAN = 2,
    /**
     * Value that indicates that floating-point numeric type should be used.
     */
    NUMBER_FLOAT = 3,
    /**
     * Value that indicates that integer number type should be used.
     */
    NUMBER_INT = 4,
    /**
     * Value that indicates that (JSON) Object type should be used.
     */
    OBJECT = 5,
    /**
     * Value that indicates shape should not be structural.
     */
    SCALAR = 6,
    /**
     * Value that indicates that (JSON) String type should be used.
     */
    STRING = 7
}
/**
 * General-purpose decorator used for configuring details of how values of properties are to be serialized.
 * This decorator does not have specific universal interpretation: instead, effect depends on datatype of property being decorated.
 *
 * Iterables, such as `Array` and `Set`, can be serialized as JSON Objects if {@link JsonFormatShape.OBJECT} is used.
 *
 * **IMPORTANT NOTE**: To be able to use {@link JsonFormat} on class properties of type `Date`
 * with {@link JsonFormatShape.STRING}, a date library needs to be set.
 * Date libraries supported: {@link https://github.com/moment/moment}, {@link https://github.com/iamkun/dayjs/}.
 *
 * @example
 * ```typescript
 * class Event {
 *   @JsonProperty() @JsonClassType({type: () => [String]})
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
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   @JsonFormat({
 *     shape: JsonFormatShape.STRING,
 *     toFixed: 2
 *   })
 *   @JsonDeserialize({using: (value: string) => parseFloat(value)})
 *   price: number;
 *
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   @JsonFormat({
 *     shape: JsonFormatShape.BOOLEAN
 *   })
 *   @JsonDeserialize({using: (value: boolean) => value ? 1 : 0})
 *   canceled: number;
 *
 *   @JsonProperty() @JsonClassType({type: () => [Object, [String, String]]})
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
export declare const JsonFormat: JsonFormatDecorator;
