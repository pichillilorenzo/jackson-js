/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, hasMetadata, makeJacksonDecorator} from '../util';
import {JsonBackReferenceDecorator, JsonBackReferenceOptions} from '../@types';
import {JacksonError} from '../core/JacksonError';
import {JsonBackReferencePrivateOptions} from '../@types/private';

/**
 * Decorator used to indicate that associated property is part of two-way linkage between fields;
 * and that its role is "child" (or "back") link. Value type of the property must be a Class:
 * it can not be an `Iterable` or a `Map`.
 * Linkage is handled such that the property decorated with this decorator is not serialized;
 * and during deserialization, its value is set to instance that has
 * the "managed" (forward) link (see {@link JsonManagedReference}).
 *
 * All references have logical name to allow handling multiple linkages;
 * typical case would be that where nodes have both parent/child and sibling linkages.
 * If so, pairs of references should be named differently.
 * It is an error for a class to have multiple back references with same name,
 * even if types pointed are different.
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
 *   @JsonClass({class: () => [Array, [Item]]})
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
 *   @JsonClass({class: () => [User]})
 *   @JsonBackReference()
 *   owner: User;
 * }
 * ```
 */
export const JsonBackReference: JsonBackReferenceDecorator = makeJacksonDecorator(
  (o: JsonBackReferenceOptions = {}): JsonBackReferenceOptions => ({
    enabled: true,
    value: 'defaultReference',
    ...o
  }),
  (options: JsonBackReferenceOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      if (hasMetadata('JsonBackReference:' + options.value, target.constructor, null, {withContextGroups: options.contextGroups})) {
        // eslint-disable-next-line max-len
        throw new JacksonError(`Multiple back-reference properties with name "${options.value}" at ${target.constructor}["${propertyKey.toString()}"].'`);
      }

      const privateOptions: JsonBackReferencePrivateOptions = {
        propertyKey: propertyKey.toString(),
        ...options
      };

      if (descriptorOrParamIndex != null && typeof (descriptorOrParamIndex as TypedPropertyDescriptor<any>).value === 'function') {
        const methodName = propertyKey.toString();
        const prefix = methodName.startsWith('get') ? 'set' : 'get';
        const oppositePropertyKey = prefix + methodName.substring(3);
        const oppositePrivateOptions: JsonBackReferencePrivateOptions = {
          propertyKey: oppositePropertyKey,
          ...options
        };
        defineMetadata('JsonBackReference', oppositePrivateOptions, target.constructor, oppositePropertyKey);
        if (prefix === 'set') {
          defineMetadata('JsonBackReference', oppositePrivateOptions,
            target.constructor, null, {
              suffix: oppositePrivateOptions.value
            });
        }
      } else {
        defineMetadata('JsonBackReference', privateOptions, target.constructor, null, {
          suffix: privateOptions.value
        });
      }

      defineMetadata('JsonBackReference', privateOptions, target.constructor, propertyKey);
    }
  });
