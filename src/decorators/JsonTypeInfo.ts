/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
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
  WRAPPER_ARRAY,
  /**
   * Inclusion mechanism similar to `PROPERTY`, except that
   * property is included one-level higher in hierarchy, i.e. as sibling
   * property at same level as JSON Object to type.
   * Note that this choice **can only be used for properties**, not
   * for types (classes). Trying to use it for classes will result in
   * inclusion strategy of basic `PROPERTY` instead.
   */
  EXTERNAL_PROPERTY
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
 *   @JsonProperty() @JsonClassType({type: () => [String]})
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
    if (descriptorOrParamIndex == null && propertyKey == null) {
      defineMetadata('JsonTypeInfo', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      defineMetadata(
        'JsonTypeInfoParam',
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor', {
          suffix: descriptorOrParamIndex.toString()
        });
    }
    if (propertyKey != null) {
      defineMetadata('JsonTypeInfo', options, target.constructor, propertyKey);
    }
  });
