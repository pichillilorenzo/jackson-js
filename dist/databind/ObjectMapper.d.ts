import { JsonParserOptions, JsonStringifierOptions, ObjectMapperDeserializer, ObjectMapperFeatures, ObjectMapperSerializer } from '../@types';
export declare class ObjectMapper {
    features: ObjectMapperFeatures;
    serializers: ObjectMapperSerializer[];
    deserializers: ObjectMapperDeserializer[];
    constructor();
    stringify<T>(obj: T, options?: JsonStringifierOptions): string;
    parse<T>(text: string, options?: JsonParserOptions): T;
    private sortMappersByOrder;
}
