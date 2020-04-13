/**
 * @packageDocumentation
 * @module Decorators
 */

import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonAnyGetterDecorator, JsonAnyGetterOptions} from '../@types';
import {JacksonError} from '../core/JacksonError';
import {JsonAnyGetterPrivateOptions} from '../@types/private';

/**
 * Decorator that can be used to define a non-static, no-argument method to be an "any getter";
 * accessor for getting a set of key/value pairs, to be serialized as part of containing Class (similar to unwrapping)
 * along with regular property values it has.
 * This typically serves as a counterpart to "any setter" mutators (see {@link JsonAnySetter}).
 * Note that the return type of decorated methods must be a `Map` or an `Object Literal`).
 *
 * As with {@link JsonAnySetter}, only one property should be annotated with this annotation;
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
    if (propertyKey) {
      const privateOptions: JsonAnyGetterPrivateOptions = {
        propertyKey: propertyKey.toString(),
        ...options
      };
      if (Reflect.hasMetadata('jackson:JsonAnyGetter', target.constructor)) {
        throw new JacksonError(`Multiple 'any-getters' defined for "${target.constructor.name}".`);
      }

      if (!privateOptions.value) {
        if (descriptorOrParamIndex != null && typeof (descriptorOrParamIndex as TypedPropertyDescriptor<any>).value === 'function') {
          const methodName = propertyKey.toString();
          if (methodName.startsWith('get')) {
            privateOptions.value = methodName.substring(3);
            if (privateOptions.value.length > 0) {
              privateOptions.value = privateOptions.value.charAt(0).toLowerCase() + privateOptions.value.substring(1);
            }
          }
          if (!privateOptions.value) {
            // eslint-disable-next-line max-len
            throw new JacksonError(`Invalid usage of @JsonAnyGetter() on ${target.constructor.name}.${propertyKey.toString()}. You must either define a non-empty @JsonAnyGetter() option value or change the method name starting with "get".`);
          }
        } else {
          privateOptions.value = propertyKey.toString();
        }
      }

      Reflect.defineMetadata('jackson:JsonAnyGetter', privateOptions, target.constructor);
    }
  });
