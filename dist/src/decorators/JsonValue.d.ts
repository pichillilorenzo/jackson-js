/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonValueDecorator } from '../@types';
/**
 * Decorator that indicates that the value of annotated accessor (either field or "getter" method)
 * is to be used as the single value to serialize for the instance,
 * instead of the usual method of collecting properties of value.
 *
 * At most one accessor of a Class can be annotated with this annotation;
 * if more than one is found, an exception may be thrown.
 *
 * @example
 * ```typescript
 * class Company {
 *   @JsonProperty()
 *   name: string;
 *   @JsonProperty()
 *   @JsonClass({class: () => [Array, [Employee]]})
 *   employees: Employee[] = [];
 * }
 *
 * class Employee {
 *   @JsonProperty()
 *   name: string;
 *   @JsonProperty()
 *   age: number;
 *
 *   @JsonValue()
 *   toEmployeeInfo(): string {
 *     return this.name + ' - ' + this.age;
 *   }
 * }
 * ```
 */
export declare const JsonValue: JsonValueDecorator;
