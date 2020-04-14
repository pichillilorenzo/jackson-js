/**
 * @packageDocumentation
 * @module Decorators
 */

import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {
  JsonIdentityReferenceDecorator,
  JsonIdentityReferenceOptions
} from '../@types';

/**
 * Decorator that can be used for customizing details of a reference to Objects for
 * which "Object Identity" is enabled (see JsonIdentityInfo).
 * The main use case is that of enforcing use of Object Id even for the first time an Object is referenced,
 * instead of first instance being serialized as full Class.
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
 * @JsonIdentityReference({alwaysAsId: true})
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
export const JsonIdentityReference: JsonIdentityReferenceDecorator = makeJacksonDecorator(
  (o: JsonIdentityReferenceOptions): JsonIdentityReferenceOptions => (
    {
      enabled: true,
      ...o
    }),
  (options: JsonIdentityReferenceOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (descriptorOrParamIndex == null && isClass(target)) {
      Reflect.defineMetadata('jackson:JsonIdentityReference', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      Reflect.defineMetadata(
        'jackson:JsonIdentityReferenceParam:' + descriptorOrParamIndex.toString(),
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor');
    }
    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonIdentityReference', options, target.constructor, propertyKey);
    }
  });
