/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonGetterDecorator } from '../@types';
/**
 * Decorator that can be used to define a non-static,
 * no-argument value-returning (non-void) method to be used as a "getter" for a logical property.
 * It can be used as an alternative to more general {@link JsonProperty} annotation
 * (which is the recommended choice in general case).
 *
 * Getter means that when serializing Object instance of class that has this method
 * (possibly inherited from a super class), a call is made through the method,
 * and return value will be serialized as value of the property.
 *
 * @example
 * ```typescript
 * class User {
 *   @JsonProperty()
 *   id: number;
 *   @JsonProperty()
 *   firstname: string;
 *   @JsonProperty()
 *   lastname: string;
 *   @JsonProperty()
 *   fullname: string[];
 *
 *   @JsonGetter()
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
