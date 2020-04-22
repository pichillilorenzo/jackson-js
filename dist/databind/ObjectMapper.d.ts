/**
 * @packageDocumentation
 * @module Databind
 */
import { JsonParserContext, JsonStringifierContext, ObjectMapperDeserializer, ObjectMapperFeatures, ObjectMapperSerializer } from '../@types';
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
     * Property that defines features to set for {@link ObjectMapper}.
     */
    features: ObjectMapperFeatures;
    /**
     * Array of custom user-defined serializers.
     */
    serializers: ObjectMapperSerializer[];
    /**
     * Array of custom user-defined deserializers.
     */
    deserializers: ObjectMapperDeserializer[];
    /**
     *
     */
    constructor();
    /**
     * Method for serializing a JavaScript object or a value to a JSON string.
     *
     * @param obj - the JavaScript object or value to be serialized.
     * @param context - the context to be used during serialization.
     */
    stringify<T>(obj: T, context?: JsonStringifierContext): string;
    /**
     * Method for deserializing a JSON string into a JavaScript object or value.
     *
     * @param text - the JSON string to be deserialized.
     * @param context - the context to be used during deserialization.
     */
    parse<T>(text: string, context?: JsonParserContext): T;
    /**
     * Sort custom user-defined serializers/deserializers by its order.
     *
     * @param mappers
     */
    private sortMappersByOrder;
}
