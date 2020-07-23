/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, getArgumentNames, isNativeCode, makeJacksonDecorator} from '../util';
import {JsonPropertyDecorator, JsonPropertyOptions} from '../@types';
import {JacksonError} from '../core/JacksonError';

/**
 * Used by {@link JsonProperty}, it specifies how property
 * may be accessed during serialization and deserialization.
 */
export enum JsonPropertyAccess {
  /**
   * Access setting that means that the property may only be read for serialization
   * but not written (set) during deserialization.
   */
  READ_ONLY,
  /**
   * Access setting that means that the property will be accessed for both serialization
   * (writing out values as external representation) and deserialization
   * (reading values from external representation).
   */
  READ_WRITE,
  /**
   * Access setting that means that the property may only be written (set) as part of deserialization
   * but will not be read (get) for serialization, that is,
   * the value of the property is not included in serialization.
   */
  WRITE_ONLY
}

/**
 * Decorator that can be used to define a non-static method as a "setter" or "getter"
 * for a logical property (depending on its signature: starting with "get" for Getters and "set" for Setters),
 * or non-static object field to be used (serialized, deserialized) as a logical property.
 *
 * If no option value is defined, then the field name is used as the property name without any modifications,
 * but it can be specified to non-empty value to specify different name.
 * Property name refers to name used externally, as the field name in JSON objects.
 *
 * **IMPORTANT**: Each class property (or its getter/setter) must be decorated with this decorator,
 * otherwise deserialization and serialization will not work properly!
 * That's because, for example, given a JavaScript class, there isn't any way or API
 * (such as Reflection API for Java - {@link https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/package-summary.html})
 * to get all the class properties and its types (see {@link JsonClassType}).
 *
 * @example
 * ```typescript
 * class User {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   firstname: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   lastname: string;
 *
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   getFullname(): string {
 *     return this.firstname + ' ' + this.lastname;
 *   }
 *
 *   @JsonProperty()
 *   setFullname(fullname: string) {
 *     const fullnameSplitted = fullname.split(' ');
 *     this.firstname = fullnameSplitted[0];
 *     this.lastname = fullnameSplitted[0];
 *   }
 * }
 * ```
 */
export const JsonProperty: JsonPropertyDecorator = makeJacksonDecorator(
  (o: JsonPropertyOptions = {}): JsonPropertyOptions => ({
    enabled: true,
    required: false,
    access: JsonPropertyAccess.READ_WRITE,
    ...o
  }),

  (options: JsonPropertyOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null && !options.value) {
      if (descriptorOrParamIndex != null && typeof (descriptorOrParamIndex as TypedPropertyDescriptor<any>).value === 'function') {
        const methodName = propertyKey.toString();
        if (methodName.startsWith('get') || methodName.startsWith('set')) {
          options.value = methodName.substring(3);
          if (options.value.length > 0) {
            options.value = options.value.charAt(0).toLowerCase() + options.value.substring(1);
          }
        }
        if (!options.value) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Invalid usage of @JsonProperty() on ${(isNativeCode(target.constructor) ? target : target.constructor).name}.${propertyKey.toString()}. You must either define a non-empty @JsonProperty() option value or change the method name starting with "get" for Getters or "set" for Setters.`);
        }
      } else {
        options.value = propertyKey.toString();
      }
    }

    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      if (!options.value || (propertyKey != null && options.value === propertyKey.toString())) {
        const method = (propertyKey) ? target[propertyKey.toString()] : target;
        const argNames = getArgumentNames(method);
        options.value = argNames[descriptorOrParamIndex];
      }

      defineMetadata(
        'JsonPropertyParam',
        options, isNativeCode(target.constructor) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor', {
          suffix: descriptorOrParamIndex.toString()
        });
    }

    if (propertyKey != null) {
      defineMetadata('JsonProperty', options, target.constructor, propertyKey);
      defineMetadata('JsonProperty', options, target.constructor, null, {
        suffix: propertyKey.toString()
      });
      defineMetadata('JsonVirtualProperty', options, target.constructor, null, {
        suffix: propertyKey.toString()
      });
    }
  });
