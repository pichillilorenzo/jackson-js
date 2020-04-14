/**
 * @packageDocumentation
 * @module Decorators
 */

import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonTypeInfoDecorator, JsonTypeInfoOptions} from '../@types';

/**
 * Definition of different type identifiers that can be included in JSON during serialization, and used for deserialization.
 */
export enum JsonTypeInfoId {
  /**
   * Means that logical type name is used as type information;
   * name will then need to be separately resolved to actual concrete type (Class).
   */
  NAME
}

/**
 * Definition of standard type inclusion mechanisms for type metadata.
 */
export enum JsonTypeInfoAs {
  /**
   * Inclusion mechanism that uses a single configurable property, included along with actual data
   * (Class properties) as a separate meta-property.
   */
  PROPERTY,
  /**
   * Inclusion mechanism that wraps typed JSON value (Class serialized as JSON)
   * in a JSON Object that has a single entry, where field name is serialized type identifier,
   * and value is the actual JSON value.
   */
  WRAPPER_OBJECT,
  /**
   * Inclusion mechanism that wraps typed JSON value (Class serialized as JSON)
   * in a 2-element JSON array: first element is the serialized type identifier,
   * and second element the serialized Class as JSON Object.
   */
  WRAPPER_ARRAY
}

/**
 * Decorator used for configuring details of if and how type information is used
 * with JSON serialization and deserialization, to preserve information about actual class of Object instances.
 * This is necessarily for polymorphic types, and may also be needed to link abstract declared types
 * and matching concrete implementation.
 *
 * When used for properties (fields, methods), this decorator applies to values:
 * so when applied to Iterables and Maps, it will apply to contained values, not the container.
 *
 * @example
 * ```typescript
 * @JsonTypeInfo({
 *   use: JsonTypeInfoId.NAME,
 *   include: JsonTypeInfoAs.PROPERTY
 * })
 * @JsonSubTypes({
 *   types: [
 *     {class: () => Dog, name: 'dog'},
 *     {class: () => Cat, name: 'cat'},
 *   ]
 * })
 * class Animal {
 *   @JsonProperty()
 *   name: string;
 * }
 *
 * @JsonTypeName({value: 'dog'})
 * class Dog extends Animal {
 *
 * }
 *
 * @JsonTypeName({value: 'cat'})
 * class Cat extends Animal {
 *
 * }
 * ```
 */
export const JsonTypeInfo: JsonTypeInfoDecorator = makeJacksonDecorator(
  (o: JsonTypeInfoOptions): JsonTypeInfoOptions => (
    {
      enabled: true,
      use: JsonTypeInfoId.NAME,
      include: JsonTypeInfoAs.PROPERTY,
      property: '@type',
      ...o
    }),
  (options: JsonTypeInfoOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!descriptorOrParamIndex && typeof descriptorOrParamIndex !== 'number' && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonTypeInfo', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      Reflect.defineMetadata(
        'jackson:JsonTypeInfoParam:' + descriptorOrParamIndex.toString(),
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor');
    }
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonTypeInfo', options, target.constructor, propertyKey);
    }
  });
