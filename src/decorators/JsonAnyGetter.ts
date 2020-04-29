/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, hasMetadata, makeJacksonDecorator} from '../util';
import {JsonAnyGetterDecorator, JsonAnyGetterOptions} from '../@types';
import {JacksonError} from '../core/JacksonError';

/**
 * Decorator that can be used to define a non-static, no-argument method to be an "any getter";
 * accessor for getting a set of key/value pairs, to be serialized as part of containing Class (similar to unwrapping)
 * along with regular property values it has.
 * This typically serves as a counterpart to "any setter" mutators (see {@link JsonAnySetter}).
 * Note that the return type of decorated methods must be a `Map` or an `Object Literal`).
 *
 * As with {@link JsonAnySetter}, only one property should be decorated with this decorator;
 * if multiple methods are decorated, an exception may be thrown.
 *
 * @example
 * ```typescript
 * class ScreenInfo {
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   id: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   title: string;
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   width: number;
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   height: number;
 *   @JsonProperty() @JsonClassType({type: () => [Map, [String, Object]]})
 *   otherInfo: Map<string, any> = new Map<string, any>();
 *
 *   @JsonClassType({type: () => [Map, [String, Object]]})
 *   @JsonAnyGetter({for: 'otherInfo'})
 *   public getOtherInfo(): Map<string, any> {
 *     return this.otherInfo;
 *   }
 * }
 * ```
 */
export const JsonAnyGetter: JsonAnyGetterDecorator = makeJacksonDecorator(
  (o: JsonAnyGetterOptions): JsonAnyGetterOptions => ({enabled: true, ...o}),
  (options: JsonAnyGetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      if (hasMetadata('JsonAnyGetter', target.constructor, null, {withContextGroups: options.contextGroups})) {
        throw new JacksonError(`Multiple 'any-getters' defined for "${target.constructor.name}".`);
      }

      if (!options.value) {
        if (descriptorOrParamIndex != null && typeof (descriptorOrParamIndex as TypedPropertyDescriptor<any>).value === 'function') {
          const methodName = propertyKey.toString();
          if (methodName.startsWith('get')) {
            options.value = methodName.substring(3);
            if (options.value.length > 0) {
              options.value = options.value.charAt(0).toLowerCase() + options.value.substring(1);
            }
          }
          if (!options.value) {
            // eslint-disable-next-line max-len
            throw new JacksonError(`Invalid usage of @JsonAnyGetter() on ${target.constructor.name}.${propertyKey.toString()}. You must either define a non-empty @JsonAnyGetter() option value or change the method name starting with "get".`);
          }
        } else {
          options.value = propertyKey.toString();
        }
      }

      defineMetadata('JsonAnyGetter', options, target.constructor);
    }
  });
