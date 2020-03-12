import {JsonStringifier} from "../core/JsonStringifier";
import {
  JsonParserOptions,
  JsonStringifierOptions,
  ObjectMapperDeserializer,
  ObjectMapperFeatures, ObjectMapperCustomMapper, ObjectMapperSerializer
} from "../@types";
import {JsonParser} from "../core/JsonParser";
import {SerializationFeature} from "./SerializationFeature";
import {DeserializationFeature} from "./DeserializationFeature";

export class ObjectMapper {
  features: ObjectMapperFeatures = {
    serialization: {
      [SerializationFeature.FAIL_ON_SELF_REFERENCES]: true
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
    return JsonStringifier.stringify<T>(obj, {
      serializers: this.serializers,
      features: this.features.serialization,
      ...options
    });
  }

  parse<T, R>(text: string, options?: JsonParserOptions<R>): T {
    this.deserializers = this.sortMappersByOrder(this.deserializers);
    return JsonParser.parse<T, R>(text, {
      deserializers: this.deserializers,
      features: this.features.deserialization,
      ...options
    });
  }

  sortMappersByOrder<T>(mappers: ObjectMapperCustomMapper<T>[]): ObjectMapperCustomMapper<T>[] {
    return mappers.sort((a, b) => {
      return a.order - b.order > 0 ? 1 : -1;
    });
  }
}
