/**
 * @packageDocumentation
 * @module Databind
 */
import { CommonFeature } from './CommonFeature';
/**
 * Interface that defines features to set for {@link ObjectMapper} and {@link JsonParser}.
 *
 * Changes only take effect when done before any deserialization calls --
 * that is, caller must follow "configure-then-use" pattern.
 */
export interface DeserializationFeature extends CommonFeature {
    /**
     * Feature that will allow for more forgiving deserialization of incoming JSON.
     * If enabled, the class properties will be matched using their lower-case equivalents,
     * meaning that any case-combination (incoming and matching names are canonicalized by lower-casing) should work.
     */
    ACCEPT_CASE_INSENSITIVE_PROPERTIES?: boolean;
    /**
     * Feature that can be enabled to allow empty JSON Array value (that is, `[]`)
     * to be bound to JavaScript as `null`.
     */
    ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT?: boolean;
    /**
     * Feature that can be enabled to allow JSON empty String value (`""`) to be bound as `null`.
     */
    ACCEPT_EMPTY_STRING_AS_NULL_OBJECT?: boolean;
    /**
     * Feature that determines whether coercions from secondary representations are allowed for
     * simple non-textual scalar types: numbers and booleans.
     *
     * When feature is enabled, conversions from JSON String are allowed, as long as textual value matches
     * (for example, String "true" is allowed as equivalent of JSON boolean token `true`; or String "1.5" for `Number`).
     */
    ALLOW_COERCION_OF_SCALARS?: boolean;
    /**
     * Feature that determines whether encountering of unknown properties
     * (ones that do not map to a property, and there is no "any setter" or handler that can handle it)
     * should result in a failure (by throwing a {@link JacksonError}) or not.
     * This setting only takes effect after all other handling methods for unknown properties have been tried,
     * and property remains unhandled.
     */
    FAIL_ON_UNKNOWN_PROPERTIES?: boolean;
    /**
     * Feature that determines whether encountering of JSON null is an error when deserializing into
     * JavaScript primitive types: `Number`, `String`, `Boolean`, `BigInt` and `Symbol`.
     * If it is, a {@link JacksonError} is thrown to indicate this.
     */
    FAIL_ON_NULL_FOR_PRIMITIVES?: boolean;
    /**
     * Feature that determines what happens if one or more Creator properties(properties bound to parameters of Creator method
     * (constructor or static factory method)) are missing value to bind to from content.
     * If enabled, such missing values result in a {@link JacksonError} being thrown with information on the
     * first one (by index) of missing properties.
     *
     * Note that having an injectable value counts as "not missing".
     */
    FAIL_ON_MISSING_CREATOR_PROPERTIES?: boolean;
    /**
     * Feature that determines what happens if one or more Creator properties (properties bound to parameters of Creator method
     * (constructor or static factory method)) are bound to `null` values - either from the JSON or as a default value.
     * If enabled, such `null` values result in a {@link JacksonError} being thrown with information on the
     * first one (by index) of `null` values.
     */
    FAIL_ON_NULL_CREATOR_PROPERTIES?: boolean;
    /**
     * Feature that determines what happens if an Object Id reference is encountered that does not refer to an actual
     * Object with that id ("unresolved Object Id").
     * If enabled, a {@link JacksonError} is thrown at the end of deserialization; if disabled, a `null` object is used instead.
     * Note that if this is set to `false`, no further processing is done;
     * specifically, if reference is defined via setter method, that method will NOT be called.
     */
    FAIL_ON_UNRESOLVED_OBJECT_IDS?: boolean;
    /**
     * Feature that determines what happens when type of a polymorphic value (indicated for example by {@link JsonTypeInfo})
     * cannot be found (missing) or resolved (invalid class name, unmappable id).
     * If enabled, a {@link JacksonError} is thrown; if disabled, the type will be based on the context.
     */
    FAIL_ON_INVALID_SUBTYPE?: boolean;
    /**
     * Feature that determines what happens when a type id is missing from the JSON Object
     * when trying to resolve type or subtype of a class decorated with {@link JsonTypeInfo} and
     * using {@link JsonTypeInfoAs.PROPERTY} as {@link JsonTypeInfoOptions.include} option value.
     * If enabled, a {@link JacksonError} is thrown when type id is missing;
     * if disabled, the type will be based on the context.
     */
    FAIL_ON_MISSING_TYPE_ID?: boolean;
    /**
     * Feature to allow "unwrapping" root-level JSON value, to match setting of {@link SerializationFeature.WRAP_ROOT_VALUE}
     * used for serialization. Will verify that the root JSON value is a JSON Object,
     * and that it has a single property with expected root name.
     * If not, a {@link JacksonError} is thrown;
     * otherwise value of the wrapped property will be deserialized as if it was the root value.
     */
    UNWRAP_ROOT_VALUE?: boolean;
}
/**
 * Variable that defines default feature values for {@link ObjectMapper} and {@link JsonParser}.
 */
export declare const DefaultDeserializationFeatureValues: DeserializationFeature;
