/**
 * @packageDocumentation
 * @module Decorators
 */

import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
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
 * Decorator used for indicating that values of annotated type or property should be serializing
 * so that instances either contain additional object identifier (in addition actual object properties),
 * or as a reference that consists of an object id that refers to a full serialization.
 * In practice this is done by serializing the first instance as full object and object identity,
 * and other references to the object as reference values.
 *
 * @example
 * ```typescript
 * @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'User'})
 * class User {
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   email: string;
 *   @JsonProperty()
 *   firstname: string;
 *   @JsonProperty()
 *   lastname: string;
 *
 *   @JsonProperty()
 *   @JsonClass({class: () => [Array, [Item]]})
 *   items: Item[] = [];
 * }
 *
 * @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'Item'})
 * class Item {
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonClass({class: () => [User]})
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
    if (!descriptorOrParamIndex && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonIdentityInfo', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      Reflect.defineMetadata(
        'jackson:JsonIdentityInfoParam:' + descriptorOrParamIndex.toString(),
        options, target, (propertyKey) ? propertyKey : 'constructor');
    }
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonIdentityInfo', options, target.constructor, propertyKey);
    }
  });
