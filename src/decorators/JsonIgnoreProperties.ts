/**
 * @packageDocumentation
 * @module Decorators
 */

import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonIgnorePropertiesDecorator, JsonIgnorePropertiesOptions} from '../@types';

/**
 * Annotation that can be used to either suppress serialization of properties (during serialization),
 * or ignore processing of JSON properties read (during deserialization).
 *
 * @example
 * ```typescript
 * @JsonIgnoreProperties({
 *   value: ['firstname', 'lastname']
 * })
 * class User {
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   email: string;
 *   @JsonProperty()
 *   firstname: string;
 *   @JsonProperty()
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
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonIgnoreProperties', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      Reflect.defineMetadata(
        'jackson:JsonIgnorePropertiesParam:' + descriptorOrParamIndex.toString(),
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor');
    }
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonIgnoreProperties', options, target.constructor, propertyKey);
    }
  });
