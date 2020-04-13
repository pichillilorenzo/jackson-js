/**
 * @packageDocumentation
 * @module Decorators
 */

import {getArgumentNames, isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonPropertyDecorator, JsonPropertyOptions} from '../@types';
import {JsonPropertyPrivateOptions} from '../@types/private';
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
 * **IMPORTANT**: Each class property must be decorated with this decorator,
 * otherwise deserialization and serialization will not work!
 * That's because, for example, given a JavaScript class, there isn't any way or API
 * (such as Reflection API for Java - {@link https://docs.oracle.com/javase/8/docs/api/java/lang/reflect/package-summary.html})
 * to get all the class properties and its types (see {@link JsonClass}).
 *
 * @example
 * ```typescript
 * class User {
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   firstname: string;
 *   @JsonProperty()
 *   lastname: string;
 *
 *   @JsonProperty()
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
    const privateOptions: JsonPropertyPrivateOptions = {
      descriptor: (typeof descriptorOrParamIndex !== 'number') ? descriptorOrParamIndex : null,
      propertyKey: (propertyKey != null) ? propertyKey.toString() : null,
      ...options
    };

    if (propertyKey != null && !privateOptions.value) {
      if (descriptorOrParamIndex != null && typeof (descriptorOrParamIndex as TypedPropertyDescriptor<any>).value === 'function') {
        const methodName = propertyKey.toString();
        if (methodName.startsWith('get') || methodName.startsWith('set')) {
          privateOptions.value = methodName.substring(3);
          if (privateOptions.value.length > 0) {
            privateOptions.value = privateOptions.value.charAt(0).toLowerCase() + privateOptions.value.substring(1);
          }
        }
        if (!privateOptions.value) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Invalid usage of @JsonProperty() on ${((target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor).name}.${propertyKey.toString()}. You must either define a non-empty @JsonProperty() option value or change the method name starting with "get" for Getters or "set" for Setters.`);
        }
      } else {
        privateOptions.value = propertyKey.toString();
      }
    }

    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      if (!privateOptions.value || (propertyKey != null && privateOptions.value === propertyKey.toString())) {
        const method = (propertyKey) ? target[propertyKey.toString()] : target;
        const argNames = getArgumentNames(method);
        privateOptions.value = argNames[descriptorOrParamIndex];
      }

      Reflect.defineMetadata(
        'jackson:JsonPropertyParam:' + descriptorOrParamIndex.toString(),
        privateOptions, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor');
    }

    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonProperty', privateOptions, target.constructor, propertyKey);
      Reflect.defineMetadata('jackson:JsonProperty:' + propertyKey.toString(), privateOptions, target.constructor);
      Reflect.defineMetadata('jackson:JsonVirtualProperty:' + propertyKey.toString(), privateOptions, target.constructor);
    }
  });
