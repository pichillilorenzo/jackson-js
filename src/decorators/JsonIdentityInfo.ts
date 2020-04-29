/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
import {
  JsonIdentityInfoDecorator,
  JsonIdentityInfoOptions
} from '../@types';

/**
 * Generator to use for producing Object Identifier for objects
 */
export enum ObjectIdGenerator {
  /**
   * Simple sequence-number based generator, which uses basic integers (starting with value 1) as Object Identifiers.
   */
  IntSequenceGenerator,
  /**
   * Used to allow explicitly specifying that no generator is used.
   */
  None,
  /**
   * Used to denote case where Object Identifier to use comes from a Class property (getter method or field).
   * If so, value is written directly during serialization, and used as-is during deserialization.
   */
  PropertyGenerator,
  /**
   * Implementation that just uses version 5 UUIDs as reliably unique identifiers.
   * UUIDs are generated using the {@link https://github.com/uuidjs/uuid} library.
   */
  UUIDv5Generator,
  /**
   * Implementation that just uses version 4 UUIDs as reliably unique identifiers.
   * UUIDs are generated using the {@link https://github.com/uuidjs/uuid} library.
   */
  UUIDv4Generator,
  /**
   * Implementation that just uses version 3 UUIDs as reliably unique identifiers.
   * UUIDs are generated using the {@link https://github.com/uuidjs/uuid} library.
   */
  UUIDv3Generator,
  /**
   * Implementation that just uses version 1 UUIDs as reliably unique identifiers.
   * UUIDs are generated using the {@link https://github.com/uuidjs/uuid} library.
   */
  UUIDv1Generator
}

/**
 * Decorator used for indicating that values of decorated type or property should be serializing
 * so that instances either contain additional object identifier (in addition actual object properties),
 * or as a reference that consists of an object id that refers to a full serialization.
 * In practice this is done by serializing the first instance as full object and object identity,
 * and other references to the object as reference values.
 *
 * @example
 * ```typescript
 * @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'User'})
 * class User {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   email: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   firstname: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   lastname: string;
 *
 *   @JsonProperty()
 *   @JsonClassType({type: () => [Array, [Item]]})
 *   items: Item[] = [];
 * }
 *
 * @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'Item'})
 * class Item {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonClassType({type: () => [User]})
 *   owner: User;
 * }
 * ```
 */
export const JsonIdentityInfo: JsonIdentityInfoDecorator = makeJacksonDecorator(
  (o: JsonIdentityInfoOptions): JsonIdentityInfoOptions => (
    {
      enabled: true,
      property: '@id',
      uuidv5: {},
      uuidv4: {},
      uuidv3: {},
      uuidv1: {},
      ...o
    }),
  (options: JsonIdentityInfoOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (descriptorOrParamIndex == null && propertyKey == null) {
      defineMetadata('JsonIdentityInfo', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      defineMetadata(
        'JsonIdentityInfoParam',
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor', {
          suffix: descriptorOrParamIndex.toString()
        });
    }
    if (propertyKey != null) {
      defineMetadata('JsonIdentityInfo', options, target.constructor, propertyKey);
    }
  });
