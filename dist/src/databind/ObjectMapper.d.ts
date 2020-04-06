/**
 * @packageDocumentation
 * @module Databind
 */
import { JsonParserContext, JsonStringifierContext, ObjectMapperDeserializer, ObjectMapperFeatures, ObjectMapperSerializer } from '../@types';
/**
 *
 */
export declare class ObjectMapper {
    features: ObjectMapperFeatures;
    serializers: ObjectMapperSerializer[];
    deserializers: ObjectMapperDeserializer[];
    /**
     *
     */
    constructor();
    /**
     *
     * @param obj
     * @param context
     */
    stringify<T>(obj: T, context?: JsonStringifierContext): string;
    /**
     *
     * @param text
     * @param context
     */
    parse<T>(text: string, context?: JsonParserContext): T;
    /**
     *
     * @param mappers
     */
    private sortMappersByOrder;
}
