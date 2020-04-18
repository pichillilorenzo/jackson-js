/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
import {JsonTypeIdDecorator, JsonTypeIdOptions} from '../@types';
import {JsonTypeIdPrivateOptions} from '../@types/private';

/**
 * Decorator that can be used on a property accessor (field, getter or setter, constructor parameter)
 * to indicate that the property is to contain type id to use when including polymorphic type information.
 * This decorator should only be used if the intent is to override generation of standard type id:
 * if so, value of the property will be accessed during serialization and used as the type id.
 *
 * On deserialization, this decorator has no effect.
 *
 * On serialization, this decorator will exclude property from being serialized along other properties;
 * instead, its value is serialized as the type identifier.
 *
 * @example
 * ```typescript
 * @JsonTypeInfo({
 *   use: JsonTypeInfoId.NAME,
 *   include: JsonTypeInfoAs.WRAPPER_OBJECT
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
 *   @JsonTypeId()
 *   typeId: string;
 * }
 *
 * @JsonTypeName({value: 'cat'})
 * class Cat extends Animal {
 *   @JsonTypeId()
 *   getTypeId(): string {
 *     return 'CatTypeId';
 *   }
 * }
 * ```
 */
export const JsonTypeId: JsonTypeIdDecorator = makeJacksonDecorator(
  (o: JsonTypeIdOptions = {}): JsonTypeIdOptions => ({enabled: true, ...o}),
  (options: JsonTypeIdOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey != null) {
      const privateOptions: JsonTypeIdPrivateOptions = {
        propertyKey: propertyKey.toString(),
        ...options
      };
      defineMetadata('JsonTypeId', privateOptions, target.constructor);
    }
  });
