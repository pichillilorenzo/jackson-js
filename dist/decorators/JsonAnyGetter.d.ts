/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonAnyGetterDecorator } from '../@types';
/**
 * Decorator that can be used to define a non-static, no-argument method to be an "any getter";
 * accessor for getting a set of key/value pairs, to be serialized as part of containing Class (similar to unwrapping)
 * along with regular property values it has.
 * This typically serves as a counterpart to "any setter" mutators (see {@link JsonAnySetter}).
 * Note that the return type of decorated methods must be a `Map` or an `Object Literal`).
 *
 * As with {@link JsonAnySetter}, only one property should be decorated with this decorator;
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
 *   @JsonClassType({type: () => [Map, [String, Object]]})
 *   @JsonAnyGetter({for: 'otherInfo'})
 *   public getOtherInfo(): Map<string, any> {
 *     return this.otherInfo;
 *   }
 * }
 * ```
 */
export declare const JsonAnyGetter: JsonAnyGetterDecorator;
