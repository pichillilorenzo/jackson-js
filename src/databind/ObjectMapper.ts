/**
 * @packageDocumentation
 * @module Databind
 */

import {
  JsonStringifier
} from '../core/JsonStringifier';
import {
  JsonParserContext,
  JsonStringifierContext,
  ObjectMapperDeserializer,
  ObjectMapperFeatures, ObjectMapperCustomMapper, ObjectMapperSerializer
} from '../@types';
import {JsonParser} from '../core/JsonParser';
import {DefaultSerializationFeatureValues} from './SerializationFeature';
import {DefaultDeserializationFeatureValues} from './DeserializationFeature';
import * as cloneDeep from 'lodash.clonedeep';

/**
 * ObjectMapper provides functionality for reading and writing JSON.
 * It is also highly customizable to work both with different styles of JSON content,
 * and to support more advanced Object concepts such as polymorphism and Object identity.
 *
 * ObjectMapper will use instances of {@link JsonParser} and {@link JsonStringifier}
 * for implementing actual reading/writing of JSON.
 */
export class ObjectMapper {
  /**
   * Property that defines features to set for {@link ObjectMapper}.
   */
  features: ObjectMapperFeatures = {
    /**
     * Property that defines features to set for {@link ObjectMapper} and {@link JsonStringifier}.
     */
    serialization: cloneDeep(DefaultSerializationFeatureValues),
    /**
     * Property that defines features to set for {@link ObjectMapper} and {@link JsonParser}.
     */
    deserialization: cloneDeep(DefaultDeserializationFeatureValues)
  };

  /**
   * Array of custom user-defined serializers.
   */
  serializers: ObjectMapperSerializer[] = [];

  /**
   * Array of custom user-defined deserializers.
   */
  deserializers: ObjectMapperDeserializer[] = [];

  /**
   *
   */
  constructor() {

  }

  /**
   * Method for serializing a JavaScript object or a value to a JSON string.
   *
   * @param obj - the JavaScript object or value to be serialized.
   * @param context - the context to be used during serialization.
   */
  stringify<T>(obj: T, context?: JsonStringifierContext): string {
    this.serializers = this.sortMappersByOrder(this.serializers);

    const jsonStringifier = new JsonStringifier<T>();
    return jsonStringifier.stringify(obj, {
      withContextGroups: [],
      serializers: this.serializers,
      features: {
        serialization: this.features.serialization
      },
      filters: {},
      attributes: {},
      decoratorsEnabled: {},
      _internalDecorators: new Map(),
      ...context
    });
  }

  /**
   * Method for deserializing a JSON string into a JavaScript object or value.
   *
   * @param text - the JSON string to be deserialized.
   * @param context - the context to be used during deserialization.
   */
  parse<T>(text: string, context?: JsonParserContext): T {
    this.deserializers = this.sortMappersByOrder(this.deserializers);

    const jsonParser = new JsonParser<T>();
    return jsonParser.parse(text, {
      withContextGroups: [],
      deserializers: this.deserializers,
      features: {
        deserialization: this.features.deserialization
      },
      injectableValues: {},
      decoratorsEnabled: {},
      _internalDecorators: new Map(),
      ...context
    });
  }

  /**
   * Sort custom user-defined serializers/deserializers by its order.
   *
   * @param mappers
   */
  private sortMappersByOrder<T>(mappers: ObjectMapperCustomMapper<T>[]): ObjectMapperCustomMapper<T>[] {
    return mappers.sort((a, b) => a.order - b.order > 0 ? 1 : -1);
  }
}
