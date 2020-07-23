/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, isNativeCode, makeJacksonDecorator} from '../util';
import {JsonIgnoreDecorator, JsonIgnoreOptions} from '../@types';

/**
 * Decorator that indicates that the logical property that the accessor
 * (field, getter/setter method or Creator parameter [of JsonCreator-decorated constructor or factory method])
 * is to be ignored during serialization and deserialization functionality.
 *
 * @example
 * ```typescript
 * class Item {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   name: string;
 *
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   @JsonIgnore()
 *   category: string;
 * }
 * ```
 */
export const JsonIgnore: JsonIgnoreDecorator = makeJacksonDecorator(
  (o: JsonIgnoreOptions): JsonIgnoreOptions => ({enabled: true, ...o}),
  (options: JsonIgnoreOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      defineMetadata('JsonIgnore', options, target.constructor, propertyKey);
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      defineMetadata('JsonIgnoreParam',
        options, (isNativeCode(target.constructor)) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor', {
          suffix: descriptorOrParamIndex.toString()
        });
    }
  });
