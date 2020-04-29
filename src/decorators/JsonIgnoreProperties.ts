/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
import {JsonIgnorePropertiesDecorator, JsonIgnorePropertiesOptions} from '../@types';

/**
 * Decorator that can be used to either suppress serialization of properties (during serialization),
 * or ignore processing of JSON properties read (during deserialization).
 *
 * When used for properties (fields, methods), this decorator applies to values:
 * so when applied to Iterables and Maps, it will apply to contained values, not the container.
 *
 * @example
 * ```typescript
 * @JsonIgnoreProperties({
 *   value: ['firstname', 'lastname']
 * })
 * class User {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   email: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   firstname: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   lastname: string;
 * }
 * ```
 */
export const JsonIgnoreProperties: JsonIgnorePropertiesDecorator = makeJacksonDecorator(
  (o: JsonIgnorePropertiesOptions): JsonIgnorePropertiesOptions => (
    {
      enabled: true,
      allowGetters: false,
      allowSetters: false,
      ignoreUnknown: false,
      value: [],
      ...o
    }),
  (options: JsonIgnorePropertiesOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (descriptorOrParamIndex == null && propertyKey == null) {
      defineMetadata('JsonIgnoreProperties', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      defineMetadata(
        'JsonIgnorePropertiesParam',
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor', {
          suffix: descriptorOrParamIndex.toString()
        });
    }
    if (propertyKey != null) {
      defineMetadata('JsonIgnoreProperties', options, target.constructor, propertyKey);
    }
  });
