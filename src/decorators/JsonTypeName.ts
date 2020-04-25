/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, makeJacksonDecorator} from '../util';
import {JsonTypeNameDecorator, JsonTypeNameOptions} from '../@types';
import {JsonTypeNamePrivateOptions} from '../@types/private';

/**
 * Decorator used for binding logical name that the decorated class has.
 * Used with {@link JsonTypeInfo}.
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
export const JsonTypeName: JsonTypeNameDecorator = makeJacksonDecorator(
  (o: JsonTypeNameOptions): JsonTypeNameOptions => ({enabled: true, ...o}),
  (options: JsonTypeNameOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (descriptorOrParamIndex == null && propertyKey == null) {
      const privateOptions: JsonTypeNamePrivateOptions = {
        ctor: target,
        ...options
      };

      if (!privateOptions.value) {
        privateOptions.value = (target as ObjectConstructor).name;
      }

      defineMetadata('JsonTypeName', privateOptions, target);
      defineMetadata('JsonTypeName', privateOptions, target, null, {
        suffix: options.value
      });
      defineMetadata('JsonTypeName', privateOptions, target, null, {
        suffix: (target as ObjectConstructor).name
      });
      return target;
    }
  });
