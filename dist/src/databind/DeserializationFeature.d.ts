/**
 * @packageDocumentation
 * @module Databind
 */
/**
 * Interface that defines features to set for {@link ObjectMapper} and {@link JsonParser}.
 *
 * Changes only take effect when done before any deserialization calls --
 * that is, caller must follow "configure-then-use" pattern.
 */
export interface DeserializationFeature {
    /**
     * Feature that will allow for more forgiving deserialization of incoming JSON.
     * If enabled, the class properties will be matched using their lower-case equivalents,
     * meaning that any case-combination (incoming and matching names are canonicalized by lower-casing) should work.
     */
    ACCEPT_CASE_INSENSITIVE_PROPERTIES?: boolean;
    ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT?: boolean;
    ACCEPT_EMPTY_STRING_AS_NULL_OBJECT?: boolean;
    ACCEPT_FLOAT_AS_INT?: boolean;
    /**
     * Feature that determines whether coercions from secondary representations are allowed for
     * simple non-textual scalar types: numbers and booleans.
     *
     * When feature is enabled, conversions from JSON String are allowed, as long as textual value matches
     * (for example, String "true" is allowed as equivalent of JSON boolean token `true`; or String "1.5" for `Number`).
     */
    ALLOW_COERCION_OF_SCALARS?: boolean;
    FAIL_ON_UNKNOWN_PROPERTIES?: boolean;
    FAIL_ON_NULL_FOR_PRIMITIVES?: boolean;
    FAIL_ON_MISSING_CREATOR_PROPERTIES?: boolean;
    FAIL_ON_NULL_CREATOR_PROPERTIES?: boolean;
    FAIL_ON_UNRESOLVED_OBJECT_IDS?: boolean;
}
/**
 * Variable that defines default feature values for {@link ObjectMapper} and {@link JsonParser}.
 */
export declare const DefaultDeserializationFeatureValues: DeserializationFeature;
