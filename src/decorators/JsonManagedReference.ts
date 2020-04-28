/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, hasMetadata, makeJacksonDecorator} from '../util';
import {JsonManagedReferenceDecorator, JsonManagedReferenceOptions} from '../@types';
import {JacksonError} from '../core/JacksonError';

/**
 * Decorator used to indicate that decorated property is part of two-way linkage between fields
 * and that its role is "parent" (or "forward") link.
 * Value type (class) of property must have a single compatible property decorated with {@link JsonBackReference}.
 * Linkage is handled such that the property decorated with this decorator is handled normally
 * (serialized normally, no special handling for deserialization);
 * it is the matching back reference that requires special handling.
 *
 * All references have logical name to allow handling multiple linkages;
 * typical case would be that where nodes have both parent/child and sibling linkages.
 * If so, pairs of references should be named differently.
 * It is an error for a class too have multiple managed references with same name, even if types pointed are different.
 *
 * @example
 * ```typescript
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
 *   @JsonClassType({type: () => [Array, [Item]]})
 *   @JsonManagedReference()
 *   items: Item[] = [];
 * }
 *
 * class Item {
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonClassType({type: () => [User]})
 *   @JsonBackReference()
 *   owner: User;
 * }
 * ```
 */
export const JsonManagedReference: JsonManagedReferenceDecorator = makeJacksonDecorator(
  (o: JsonManagedReferenceOptions = {}): JsonManagedReferenceOptions => ({
    enabled: true,
    value: 'defaultReference',
    ...o
  }),
  (options: JsonManagedReferenceOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      if (hasMetadata('JsonManagedReference:' + options.value, target.constructor, null, {withContextGroups: options.contextGroups})) {
        // eslint-disable-next-line max-len
        throw new JacksonError(`Multiple managed-reference properties with name "${options.value}" at ${target.constructor}["${propertyKey.toString()}"].'`);
      }

      if (descriptorOrParamIndex != null && typeof (descriptorOrParamIndex as TypedPropertyDescriptor<any>).value === 'function') {
        const methodName = propertyKey.toString();
        const prefix = methodName.startsWith('get') ? 'set' : 'get';
        const oppositePropertyKey = prefix + methodName.substring(3);
        const oppositeOptions: JsonManagedReferenceOptions = {
          ...options,
          _propertyKey: oppositePropertyKey
        };
        defineMetadata('JsonManagedReference', oppositeOptions, target.constructor, oppositePropertyKey);
      }

      defineMetadata('JsonManagedReference', options, target.constructor, propertyKey);
    }
  });
