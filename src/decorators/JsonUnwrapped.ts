/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
import {JsonUnwrappedDecorator, JsonUnwrappedOptions} from '../@types';

/**
 * Decorator used to indicate that a property should be serialized "unwrapped";
 * that is, if it would be serialized as JSON Object, its properties are
 * instead included as properties of its containing Object.
 *
 * It cannot be applied on Iterables and in conjunction of {@link JsonTypeInfo} as it requires use of type information.
 *
 * @example
 * ```typescript
 * class User {
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   @JsonUnwrapped()
 *   @JsonClassType({type: () => [Name]})
 *   name: Name;
 * }
 *
 * class Name {
 *   @JsonProperty()
 *   first: string;
 *   @JsonProperty()
 *   last: string;
 * }
 * ```
 */
export const JsonUnwrapped: JsonUnwrappedDecorator = makeJacksonDecorator(
  (o: JsonUnwrappedOptions = {}): JsonUnwrappedOptions => ({
    enabled: true,
    prefix: '',
    suffix: '',
    ...o
  }),
  (options: JsonUnwrappedOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      defineMetadata('JsonUnwrapped', options, target.constructor, propertyKey);
      defineMetadata('JsonUnwrapped', options, target.constructor, null, {
        suffix: propertyKey.toString()
      });
    }
  });
