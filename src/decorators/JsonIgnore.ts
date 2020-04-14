/**
 * @packageDocumentation
 * @module Decorators
 */

import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonIgnoreDecorator, JsonIgnoreOptions} from '../@types';

/**
 * Decorator that indicates that the logical property that the accessor
 * (field, getter/setter method or Creator parameter [of JsonCreator-annotated constructor or factory method])
 * is to be ignored during serialization and deserialization functionality.
 *
 * @example
 * ```typescript
 * class Item {
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonIgnore()
 *   category: string;
 * }
 * ```
 */
export const JsonIgnore: JsonIgnoreDecorator = makeJacksonDecorator(
  (o: JsonIgnoreOptions): JsonIgnoreOptions => ({enabled: true, ...o}),
  (options: JsonIgnoreOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonIgnore', options, target.constructor, propertyKey);
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      Reflect.defineMetadata('jackson:JsonIgnoreParam:' + descriptorOrParamIndex.toString(),
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor');
    }
  });
