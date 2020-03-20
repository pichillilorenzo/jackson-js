import { JsonParserOptions, JsonStringifierOptions, ObjectMapperDeserializer, ObjectMapperFeatures, ObjectMapperSerializer } from '../@types';
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
     * @param options
     */
    stringify<T>(obj: T, options?: JsonStringifierOptions): string;
    /**
     *
     * @param text
     * @param options
     */
    parse<T>(text: string, options?: JsonParserOptions): T;
    /**
     *
     * @param mappers
     */
    private sortMappersByOrder;
}
