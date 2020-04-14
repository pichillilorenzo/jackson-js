/**
 * @packageDocumentation
 * @module Decorators
 */

import {makeJacksonDecorator, isClass} from '../util';
import 'reflect-metadata';
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
 *   @JsonProperty()
 *   email: string;
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   firstname: string;
 *   @JsonProperty()
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
    if (descriptorOrParamIndex == null && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonPropertyOrder', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      Reflect.defineMetadata(
        'jackson:JsonPropertyOrderParam:' + descriptorOrParamIndex.toString(),
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor');
    }
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonPropertyOrder', options, target.constructor, propertyKey);
    }
  });
