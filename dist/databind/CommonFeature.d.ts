/**
 * @packageDocumentation
 * @module Databind
 */
/**
 * Interface that defines common features to set for {@link ObjectMapper}, {@link JsonParser} and {@link JsonStringifier}.
 *
 * Changes only take effect when done before any serialization or deserialization calls --
 * that is, caller must follow "configure-then-use" pattern.
 */
export interface CommonFeature {
    /**
     * Feature that determines whether properties that have no view decorators are included
     * in JSON serialization views (see {@link JsonView} for more details on JSON Views).
     *
     * If enabled, non-decorated properties will be included; when disabled, they will be excluded.
     * So this feature changes between "opt-in" (feature disabled) and "opt-out" (feature enabled) modes.
     *
     * Default value is enabled, meaning that non-decorated properties are included
     * in all views if there is no JsonView decorator.
     */
    DEFAULT_VIEW_INCLUSION?: boolean;
    /**
     * Feature that determines whether primitive type properties that contains `null` value should
     * be serialized/deserialized with its default value or not.
     * If enabled, during serialization, the property will be serialized with its default value.
     * Instead, during deserialization, the `null` value will be substituted with its default value.
     *
     * Default values are:
     * - Number: `0`;
     * - String: `""`;
     * - Boolean: `false`;
     * - BigInt: `0n`;
     * - `null` for all other JavaScript types.
     */
    SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL?: boolean;
    /**
     * Feature that determines whether Number primitive type properties that contains `null` value should
     * be serialized/deserialized with its default value or not.
     * If enabled, during serialization, the property will be serialized with its default value.
     * Instead, during deserialization, the `null` value will be substituted with its default value.
     *
     * The default Number value is `0`.
     */
    SET_DEFAULT_VALUE_FOR_NUMBER_ON_NULL?: boolean;
    /**
     * Feature that determines whether String primitive type properties that contains `null` value should
     * be serialized/deserialized with its default value or not.
     * If enabled, during serialization, the property will be serialized with its default value.
     * Instead, during deserialization, the `null` value will be substituted with its default value.
     *
     * The default String value is `""`.
     */
    SET_DEFAULT_VALUE_FOR_STRING_ON_NULL?: boolean;
    /**
     * Feature that determines whether Boolean primitive type properties that contains `null` value should
     * be serialized/deserialized with its default value or not.
     * If enabled, during serialization, the property will be serialized with its default value.
     * Instead, during deserialization, the `null` value will be substituted with its default value.
     *
     * The default Boolean value is `false`.
     */
    SET_DEFAULT_VALUE_FOR_BOOLEAN_ON_NULL?: boolean;
    /**
     * Feature that determines whether BigInt primitive type properties that contains `null` value should
     * be serialized/deserialized with its default value or not.
     * If enabled, during serialization, the property will be serialized with its default value.
     * Instead, during deserialization, the `null` value will be substituted with its default value.
     *
     * The default BigInt value is `0n`.
     */
    SET_DEFAULT_VALUE_FOR_BIGINT_ON_NULL?: boolean;
}
/**
 * Variable that defines default feature values for {@link ObjectMapper}, {@link JsonParser} and {@link JsonStringifier}.
 */
export declare const DefaultCommonFeatureValues: CommonFeature;
