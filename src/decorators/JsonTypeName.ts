/**
 * @packageDocumentation
 * @module Decorators
 */

import {isClass, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
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
    if (descriptorOrParamIndex == null && isClass(target)) {
      const privateOptions: JsonTypeNamePrivateOptions = {
        ctor: target,
        ...options
      };

      if (!privateOptions.value) {
        privateOptions.value = (target as ObjectConstructor).name;
      }

      Reflect.defineMetadata('jackson:JsonTypeName', privateOptions, target);
      Reflect.defineMetadata('jackson:JsonTypeName:' + options.value, privateOptions, target);
      Reflect.defineMetadata('jackson:JsonTypeName:' + (target as ObjectConstructor).name, privateOptions, target);
      return target;
    }
  });
