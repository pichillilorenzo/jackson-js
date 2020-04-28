/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, hasMetadata, makeJacksonDecorator} from '../util';
import {JsonAnySetterDecorator, JsonAnySetterOptions} from '../@types';
import {JacksonError} from '../core/JacksonError';

/**
 * Decorator that can be used to define a logical "any setter" mutator using non-static two-argument method
 * (first argument name of property, second value to set) to be used as a "fallback" handler
 * for all otherwise unrecognized properties found from JSON content.
 *
 * If used, all otherwise unmapped key-value pairs from JSON Object values are added using mutator.
 *
 * As with {@link JsonAnyGetter}, only one property should be decorated with this decorator;
 * if multiple methods are decorated, an exception may be thrown.
 *
 * @example
 * ```typescript
 * class ScreenInfo {
 *   @JsonProperty()
 *   id: string;
 *   @JsonProperty()
 *   title: string;
 *   @JsonProperty()
 *   width: number;
 *   @JsonProperty()
 *   height: number;
 *   @JsonProperty()
 *   otherInfo: Map<string, any> = new Map<string, any>();
 *
 *   @JsonAnySetter()
 *   public setOtherInfo(propertyKey: string, value: any) {
 *     this.otherInfo.set(propertyKey, value);
 *   }
 * }
 * ```
 */
export const JsonAnySetter: JsonAnySetterDecorator = makeJacksonDecorator(
  (o: JsonAnySetterOptions): JsonAnySetterOptions => ({enabled: true, ...o}),
  (options: JsonAnySetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      if (hasMetadata('JsonAnySetter', target.constructor, null, {withContextGroups: options.contextGroups})) {
        throw new JacksonError(`Multiple 'any-setters' defined for "${target.constructor.name}".`);
      }
      defineMetadata('JsonAnySetter', options, target.constructor);
    }
  });
