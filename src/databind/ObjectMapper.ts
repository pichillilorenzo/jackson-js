import {
  JsonStringifier
} from '../core/JsonStringifier';
import {
  JsonParserOptions,
  JsonStringifierOptions,
  ObjectMapperDeserializer,
  ObjectMapperFeatures, ObjectMapperCustomMapper, ObjectMapperSerializer
} from '../@types';
import {JsonParser} from '../core/JsonParser';
import {SerializationFeature} from './SerializationFeature';
import {DeserializationFeature} from './DeserializationFeature';

export class ObjectMapper {
  features: ObjectMapperFeatures = {
    serialization: {
      [SerializationFeature.FAIL_ON_SELF_REFERENCES]: true,
      [SerializationFeature.FAIL_ON_UNWRAPPED_TYPE_IDENTIFIERS]: true,
      [SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS]: false,
    },
    deserialization: {
      [DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES]: true
    }
  };
  serializers: ObjectMapperSerializer[] = [];
  deserializers: ObjectMapperDeserializer[] = [];

  constructor() {

  }

  stringify<T>(obj: T, options?: JsonStringifierOptions): string {
    this.serializers = this.sortMappersByOrder(this.serializers);

    const jsonStringifier = new JsonStringifier<T>();
    return jsonStringifier.stringify(obj, {
      serializers: this.serializers,
      features: this.features.serialization,
      ...options
    });
  }

  parse<T>(text: string, options?: JsonParserOptions): T {
    this.deserializers = this.sortMappersByOrder(this.deserializers);

    const jsonParser = new JsonParser<T>();
    return jsonParser.parse(text, {
      deserializers: this.deserializers,
      features: this.features.deserialization,
      ...options
    });
  }

  private sortMappersByOrder<T>(mappers: ObjectMapperCustomMapper<T>[]): ObjectMapperCustomMapper<T>[] {
    return mappers.sort((a, b) => a.order - b.order > 0 ? 1 : -1);
  }
}
