/**
 * @packageDocumentation
 * @module Databind
 */

/**
 * Interface that defines common features to set for {@link ObjectMapper},
 * {@link JsonParser} and {@link JsonStringifier}.
 *
 * Changes only take effect when done before any serialization or deserialization calls --
 * that is, caller must follow "configure-then-use" pattern.
 */
export interface MapperFeature {
  /**
   * Feature that determines whether properties that have no view annotations are included
   * in JSON serialization views (see {@link JsonView} for more details on JSON Views).
   *
   * If enabled, non-annotated properties will be included; when disabled, they will be excluded.
   * So this feature changes between "opt-in" (feature disabled) and "opt-out" (feature enabled) modes.
   *
   * Default value is enabled, meaning that non-annotated properties are included
   * in all views if there is no JsonView annotation.
   */
  DEFAULT_VIEW_INCLUSION?: boolean;
  SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL?: boolean;
  SET_DEFAULT_VALUE_FOR_NUMBER_ON_NULL?: boolean;
  SET_DEFAULT_VALUE_FOR_STRING_ON_NULL?: boolean;
  SET_DEFAULT_VALUE_FOR_BOOLEAN_ON_NULL?: boolean;
  SET_DEFAULT_VALUE_FOR_BIGINT_ON_NULL?: boolean;
}

/**
 * Variable that defines default feature values for {@link ObjectMapper} and {@link JsonStringifier}.
 */
export const DefaultMapperFeatureValues: MapperFeature = {
  /**
   * {@link MapperFeature.DEFAULT_VIEW_INCLUSION}
   */
  DEFAULT_VIEW_INCLUSION: true,
  /**
   * {@link MapperFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL}
   */
  SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL: false,
  /**
   * {@link MapperFeature.SET_DEFAULT_VALUE_FOR_NUMBER_ON_NULL}
   */
  SET_DEFAULT_VALUE_FOR_NUMBER_ON_NULL: false,
  /**
   * {@link MapperFeature.SET_DEFAULT_VALUE_FOR_STRING_ON_NULL}
   */
  SET_DEFAULT_VALUE_FOR_STRING_ON_NULL: false,
  /**
   * {@link MapperFeature.SET_DEFAULT_VALUE_FOR_BOOLEAN_ON_NULL}
   */
  SET_DEFAULT_VALUE_FOR_BOOLEAN_ON_NULL: false,
  /**
   * {@link MapperFeature.SET_DEFAULT_VALUE_FOR_BIGINT_ON_NULL}
   */
  SET_DEFAULT_VALUE_FOR_BIGINT_ON_NULL: false
};
