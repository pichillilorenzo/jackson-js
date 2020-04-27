/**
 * @packageDocumentation
 * @module Databind
 */
import { JsonParserContext, JsonStringifierContext } from '../@types';
/**
 * ObjectMapper provides functionality for reading and writing JSON.
 * It is also highly customizable to work both with different styles of JSON content,
 * and to support more advanced Object concepts such as polymorphism and Object identity.
 *
 * ObjectMapper will use instances of {@link JsonParser} and {@link JsonStringifier}
 * for implementing actual reading/writing of JSON.
 */
export declare class ObjectMapper {
    /**
     * Default context to use during serialization.
     */
    defaultStringifierContext: JsonStringifierContext;
    /**
     * Default context to use during deserialization.
     */
    defaultParserContext: JsonParserContext;
    /**
     *
     * @param defaultStringifierContext - Default context to use during serialization.
     * @param defaultParserContext - Default context to use during deserialization.
     */
    constructor(defaultStringifierContext?: JsonStringifierContext, defaultParserContext?: JsonParserContext);
    /**
     * Method for serializing a JavaScript object or a value to a JSON string.
     * Context will be merged using {@link JsonStringifier.mergeContexts} with {@link defaultStringifierContext}.
     *
     * @param obj - the JavaScript object or value to be serialized.
     * @param context - the context to be used during serialization.
     */
    stringify<T>(obj: T, context?: JsonStringifierContext): string;
    /**
     * Method for deserializing a JSON string into a JavaScript object or value.
     * Context will be merged using {@link JsonParser.mergeContexts} with {@link defaultParserContext}.
     *
     * @param text - the JSON string to be deserialized.
     * @param context - the context to be used during deserialization.
     */
    parse<T>(text: string, context?: JsonParserContext): T;
}
