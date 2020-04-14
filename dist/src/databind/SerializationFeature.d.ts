/**
 * @packageDocumentation
 * @module Databind
 */
/**
 * Interface that defines features to set for {@link ObjectMapper} and {@link JsonStringifier}.
 *
 * Changes only take effect when done before any serialization calls --
 * that is, caller must follow "configure-then-use" pattern.
 */
export interface SerializationFeature {
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
    WRITE_NAN_AS_ZERO?: boolean;
    WRITE_POSITIVE_INFINITY_AS_NUMBER_MAX_SAFE_INTEGER?: boolean;
    WRITE_POSITIVE_INFINITY_AS_NUMBER_MAX_VALUE?: boolean;
    WRITE_NEGATIVE_INFINITY_AS_NUMBER_MIN_SAFE_INTEGER?: boolean;
    WRITE_NEGATIVE_INFINITY_AS_NUMBER_MIN_VALUE?: boolean;
    WRITE_DATES_AS_TIMESTAMPS?: boolean;
}
/**
 * Variable that defines default feature values for {@link ObjectMapper} and {@link JsonStringifier}.
 */
export declare const DefaultSerializationFeatureValues: SerializationFeature;
