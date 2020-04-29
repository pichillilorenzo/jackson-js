/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonAnySetterDecorator } from '../@types';
/**
 * Decorator that can be used to define a logical "any setter" mutator using non-static two-argument method
 * (first argument name of property, second value to set) to be used as a "fallback" handler
 * for all otherwise unrecognized properties found from JSON content.
 *
 * If used, all otherwise unmapped key-value pairs from JSON Object values are added using mutator.
 *
 * As with {@link JsonAnyGetter}, only one property should be decorated with this decorator;
 * if multiple methods are decorated, an exception may be thrown.
 *
 * @example
 * ```typescript
 * class ScreenInfo {
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   id: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   title: string;
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   width: number;
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   height: number;
 *   @JsonProperty() @JsonClassType({type: () => [Map, [String, Object]]})
 *   otherInfo: Map<string, any> = new Map<string, any>();
 *
 *   @JsonAnySetter()
 *   public setOtherInfo(propertyKey: string, value: any) {
 *     this.otherInfo.set(propertyKey, value);
 *   }
 * }
 * ```
 */
export declare const JsonAnySetter: JsonAnySetterDecorator;
