/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, isNativeCode, makeJacksonDecorator} from '../util';
import {JsonTypeIdResolverDecorator, JsonTypeIdResolverOptions} from '../@types';

/**
 * Decorator that can be used to plug a custom type identifier handler ({@link TypeIdResolver})
 * to be used for converting between JavaScript types and type id included in JSON content.
 * In simplest cases this can be a simple class with static mapping between type names and matching classes.
 *
 * @example
 * ```typescript
 * class CustomTypeIdResolver implements TypeIdResolver {
 *   idFromValue(obj: any, context: (JsonStringifierTransformerContext | JsonParserTransformerContext)): string {
 *     if (obj instanceof Dog) {
 *       return 'animalDogType';
 *     } else if (obj instanceof Cat) {
 *       return 'animalCatType';
 *     }
 *     return null;
 *   }
 *   typeFromId(id: string, context: (JsonStringifierTransformerContext | JsonParserTransformerContext)): ClassType<any> {
 *     switch (id) {
 *     case 'animalDogType':
 *       return Dog;
 *     case 'animalCatType':
 *       return Cat;
 *     }
 *     return null;
 *   };
 * }
 *
 * @JsonTypeInfo({
 *   use: JsonTypeInfoId.NAME,
 *   include: JsonTypeInfoAs.PROPERTY
 * })
 * @JsonTypeIdResolver({resolver: new CustomTypeIdResolver()})
 * class Animal {
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   name: string;
 * }
 *
 * class Dog extends Animal {
 *
 * }
 *
 * class Cat extends Animal {
 *
 * }
 * ```
 */
export const JsonTypeIdResolver: JsonTypeIdResolverDecorator = makeJacksonDecorator(
  (o: JsonTypeIdResolverOptions): JsonTypeIdResolverOptions => ({enabled: true, ...o}),
  (options: JsonTypeIdResolverOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (descriptorOrParamIndex == null && propertyKey == null) {
      defineMetadata('JsonTypeIdResolver', options, target);
      return target;
    }
    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      defineMetadata(
        'JsonTypeIdResolverParam',
        options, (isNativeCode(target.constructor)) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor', {
          suffix: descriptorOrParamIndex.toString()
        });
    }
    if (propertyKey != null) {
      defineMetadata('JsonTypeIdResolver', options, target.constructor, propertyKey);
    }
  });
