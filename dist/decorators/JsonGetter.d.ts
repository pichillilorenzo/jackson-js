/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonGetterDecorator } from '../@types';
/**
 * Decorator that can be used to define a non-static,
 * no-argument value-returning (non-void) method to be used as a "getter" for a logical property.
 * It can be used as an alternative to more general {@link JsonProperty} decorator
 * (which is the recommended choice in general case).
 *
 * Getter means that when serializing Object instance of class that has this method
 * (possibly inherited from a super class), a call is made through the method,
 * and return value will be serialized as value of the property.
 *
 * @example
 * ```typescript
 * class User {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   firstname: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   lastname: string;
 *   @JsonProperty() @JsonClassType({type: () => [Array, [String]]})
 *   fullname: string[];
 *
 *   @JsonGetter() @JsonClassType({type: () => [String]})
 *   getFullname(): string {
 *     return this.firstname + ' ' + this.lastname;
 *   }
 *
 *   @JsonSetter()
 *   setFullname(fullname: string) {
 *     this.fullname = fullname.split(' ');
 *   }
 * }
 * ```
 */
export declare const JsonGetter: JsonGetterDecorator;
