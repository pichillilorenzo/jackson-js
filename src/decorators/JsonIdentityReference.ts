/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
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
    if (descriptorOrParamIndex == null && propertyKey == null) {
      defineMetadata('JsonIdentityReference', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      defineMetadata(
        'JsonIdentityReferenceParam',
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor', {
          suffix: descriptorOrParamIndex.toString()
        });
    }
    if (propertyKey != null) {
      defineMetadata('JsonIdentityReference', options, target.constructor, propertyKey);
    }
  });
