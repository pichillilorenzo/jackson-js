/**
 * @packageDocumentation
 * @module Decorators
 */

import {makeJacksonDecorator, defineMetadata, isNativeCode} from '../util';
import {JsonPropertyOrderDecorator, JsonPropertyOrderOptions} from '../@types';

/**
 * Decorator that can be used to define ordering (possibly partial) to use when serializing object properties.
 * Properties included in decorator declaration will be serialized first (in defined order),
 * followed by any properties not included in the definition.
 * This decorator definition will override any implicit orderings.
 *
 * When used for properties (fields, methods), this decorator applies to values:
 * so when applied to Iterables and Maps, it will apply to contained values, not the container.
 *
 * @example
 * ```typescript
 * @JsonPropertyOrder({value: ['email', 'lastname']})
 * class User {
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   email: string;
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   firstname: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   lastname: string;
 * }
 * ```
 */
export const JsonPropertyOrder: JsonPropertyOrderDecorator = makeJacksonDecorator(
  (o: JsonPropertyOrderOptions): JsonPropertyOrderOptions => ({
    enabled: true,
    alphabetic: false,
    value: [],
    ...o
  }),
  (options: JsonPropertyOrderOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (descriptorOrParamIndex == null && propertyKey == null) {
      defineMetadata('JsonPropertyOrder', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      defineMetadata(
        'JsonPropertyOrderParam',
        options, (isNativeCode(target.constructor)) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor', {
          suffix: descriptorOrParamIndex.toString()
        });
    }
    if (propertyKey != null) {
      defineMetadata('JsonPropertyOrder', options, target.constructor, propertyKey);
    }
  });
