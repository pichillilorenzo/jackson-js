/**
 * @packageDocumentation
 * @module Decorators
 */

import {makeJacksonDecorator, isClass} from '../util';
import 'reflect-metadata';
import {JsonRootNameDecorator, JsonRootNameOptions} from '../@types';

/**
 * Decorator used to indicate name to use for root-level wrapping.
 *
 * @example
 * ```typescript
 * @JsonRootName()
 * class User {
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   email: string;
 * }
 * ```
 */
export const JsonRootName: JsonRootNameDecorator = makeJacksonDecorator(
  (o: JsonRootNameOptions = {}): JsonRootNameOptions => ({enabled: true, ...o}),
  (options: JsonRootNameOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && isClass(target)) {
      options.value = (options.value == null) ? (target as ObjectConstructor).name : options.value;
      Reflect.defineMetadata('jackson:JsonRootName', options, target);
      return target;
    }
  });
