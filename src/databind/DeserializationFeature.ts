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
export const DefaultDeserializationFeatureValues: DeserializationFeature = {
  /**
   * {@link DeserializationFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES}
   */
  ACCEPT_CASE_INSENSITIVE_PROPERTIES: false,
  /**
   * {@link DeserializationFeature.ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT}
   */
  ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT: false,
  /**
   * {@link DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT}
   */
  ACCEPT_EMPTY_STRING_AS_NULL_OBJECT: false,
  /**
   * {@link DeserializationFeature.ACCEPT_FLOAT_AS_INT}
   */
  ACCEPT_FLOAT_AS_INT: false,
  /**
   * {@link DeserializationFeature.ALLOW_COERCION_OF_SCALARS}
   */
  ALLOW_COERCION_OF_SCALARS: false,
  /**
   * {@link DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES}
   */
  FAIL_ON_UNKNOWN_PROPERTIES: true,
  /**
   * {@link DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES}
   */
  FAIL_ON_NULL_FOR_PRIMITIVES: false,
  /**
   * {@link DeserializationFeature.FAIL_ON_MISSING_CREATOR_PROPERTIES}
   */
  FAIL_ON_MISSING_CREATOR_PROPERTIES: false,
  /**
   * {@link DeserializationFeature.FAIL_ON_NULL_CREATOR_PROPERTIES}
   */
  FAIL_ON_NULL_CREATOR_PROPERTIES: false,
  /**
   * {@link DeserializationFeature.FAIL_ON_UNRESOLVED_OBJECT_IDS}
   */
  FAIL_ON_UNRESOLVED_OBJECT_IDS: true,
  /**
   * {@link DeserializationFeature.FAIL_ON_INVALID_SUBTYPE}
   */
  FAIL_ON_INVALID_SUBTYPE: true,
  /**
   * {@link DeserializationFeature.FAIL_ON_MISSING_TYPE_ID}
   */
  FAIL_ON_MISSING_TYPE_ID: true,
  /**
   * {@link DeserializationFeature.UNWRAP_ROOT_VALUE}
   */
  UNWRAP_ROOT_VALUE: false
};
