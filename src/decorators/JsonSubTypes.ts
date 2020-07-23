/**
 * @packageDocumentation
 * @module Decorators
 */

import {makeJacksonDecorator, defineMetadata, isNativeCode} from '../util';
import {JsonSubTypesDecorator, JsonSubTypesOptions} from '../@types';

/**
 * Decorator used with {@link JsonTypeInfo} to indicate sub-types of serializable polymorphic types,
 * and to associate logical names used within JSON content.
 *
 * Note that just decorating a property or base type with this decorator does NOT enable polymorphic type handling:
 * in addition, {@link JsonTypeInfo} decorator is needed, and only in such case is subtype information used.
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
export const JsonSubTypes: JsonSubTypesDecorator = makeJacksonDecorator(
  (o: JsonSubTypesOptions): JsonSubTypesOptions => ({enabled: true, ...o}),
  (options: JsonSubTypesOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (descriptorOrParamIndex == null && propertyKey == null) {
      defineMetadata('JsonSubTypes', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      defineMetadata(
        'JsonSubTypesParam',
        options, (isNativeCode(target.constructor)) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor', {
          suffix: descriptorOrParamIndex.toString()
        });
    }
    if (propertyKey != null) {
      defineMetadata('JsonSubTypes', options, target.constructor, propertyKey);
    }
  });
