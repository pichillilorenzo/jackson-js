/**
 * @packageDocumentation
 * @module Databind
 */
import { JsonIncludeBaseOptions } from '../@types';
import { CommonFeature } from './CommonFeature';
/**
 * Interface that defines features to set for {@link ObjectMapper} and {@link JsonStringifier}.
 *
 * Changes only take effect when done before any serialization calls --
 * that is, caller must follow "configure-then-use" pattern.
 */
export interface SerializationFeature extends CommonFeature {
    /**
     * Feature that define global inclusion rules about which properties of a Class are to be included in serialization.
     *
     * `null` indicates that no global inclusion rules are defined.
     */
    DEFAULT_PROPERTY_INCLUSION?: JsonIncludeBaseOptions | null;
    /**
     * Feature that determines what happens when a direct self-reference is detected by a Class
     * (and no Object Id handling is enabled for it):
     * either a {@link JacksonError} is thrown (if true), or reference is normally processed (false).
     */
    FAIL_ON_SELF_REFERENCES?: boolean;
    /**
     * Feature that determines whether `Map` or Object Literal entries are first sorted by key before serialization or not:
     * if enabled, additional sorting step is performed, if disabled, no additional sorting is needed.
     */
    ORDER_MAP_AND_OBJECT_LITERAL_ENTRIES_BY_KEYS?: boolean;
    /**
     * Feature that defines default property serialization order used for Class fields
     * (note: does not apply to `Map` or Object Literals serialization!):
     * if enabled, default ordering is alphabetic
     * (similar to how {@link JsonPropertyOrder} with {@link JsonPropertyOrderOptions.alphabetic} works);
     * if disabled, order is unspecified (based on what JavaScript gives us, which may be declaration order, but is not guaranteed).
     */
    SORT_PROPERTIES_ALPHABETICALLY?: boolean;
    /**
     * Feature that can be enabled to make root value wrapped within a single property JSON object, where key as the "root name".
     */
    WRAP_ROOT_VALUE?: boolean;
    /**
     * Feature that determines whether `NaN` values should be serialized as `0` or not.
     */
    WRITE_NAN_AS_ZERO?: boolean;
    /**
     * Feature that determines whether positive `Infinity` values should be serialized as `Number.MAX_SAFE_INTEGER` or not.
     */
    WRITE_POSITIVE_INFINITY_AS_NUMBER_MAX_SAFE_INTEGER?: boolean;
    /**
     * Feature that determines whether positive `Infinity` values should be serialized as `Number.MAX_VALUE` or not.
     */
    WRITE_POSITIVE_INFINITY_AS_NUMBER_MAX_VALUE?: boolean;
    /**
     * Feature that determines whether negative `Infinity` values should be serialized as `Number.MIN_SAFE_INTEGER` or not.
     */
    WRITE_NEGATIVE_INFINITY_AS_NUMBER_MIN_SAFE_INTEGER?: boolean;
    /**
     * Feature that determines whether negative `Infinity` values should be serialized as `Number.MIN_VALUE` or not.
     */
    WRITE_NEGATIVE_INFINITY_AS_NUMBER_MIN_VALUE?: boolean;
    /**
     * Feature that determines whether `Date` values are to be serialized as numeric time stamps or not.
     */
    WRITE_DATES_AS_TIMESTAMPS?: boolean;
    /**
     * Feature that determines whether Dates used as `Map` or Object Literal keys
     * are serialized as time stamps or not (if not, will be serialized as textual values).
     */
    WRITE_DATE_KEYS_AS_TIMESTAMPS?: boolean;
    /**
     * Feature that determines what happens when a direct self-reference is detected by
     * a Class (and no Object Id handling is enabled for it): if enabled write that reference as `null`;
     * if disabled, default behavior is used (which will try to serialize usually resulting in exception).
     * But if {@link FAIL_ON_SELF_REFERENCES} is enabled, this property is ignored.
     */
    WRITE_SELF_REFERENCES_AS_NULL?: boolean;
}
/**
 * Variable that defines default feature values for {@link ObjectMapper} and {@link JsonStringifier}.
 */
export declare const DefaultSerializationFeatureValues: SerializationFeature;
