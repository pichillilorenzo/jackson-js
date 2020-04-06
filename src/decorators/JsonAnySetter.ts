/**
 * @packageDocumentation
 * @module Decorators
 */

import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonAnySetterDecorator, JsonAnySetterOptions} from '../@types';
import {JacksonError} from '../core/JacksonError';
import {JsonAnySetterPrivateOptions} from '../@types/private';

/**
 * Decorator that can be used to define a logical "any setter" mutator using non-static two-argument method
 * (first argument name of property, second value to set) to be used as a "fallback" handler
 * for all otherwise unrecognized properties found from JSON content.
 *
 * If used, all otherwise unmapped key-value pairs from JSON Object values are added using mutator.
 *
 * As with {@link JsonAnyGetter}, only one property should be annotated with this annotation;
 * if multiple methods are annotated, an exception may be thrown.
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
    if (propertyKey) {
      const privateOptions: JsonAnySetterPrivateOptions = {
        propertyKey: propertyKey.toString(),
        ...options
      };
      if (Reflect.hasMetadata('jackson:JsonAnySetter', target.constructor)) {
        throw new JacksonError(`Multiple 'any-setters' defined for "${target.constructor.name}".`);
      }
      Reflect.defineMetadata('jackson:JsonAnySetter', privateOptions, target.constructor);
    }
  });
