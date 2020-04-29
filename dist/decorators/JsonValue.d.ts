/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonValueDecorator } from '../@types';
/**
 * Decorator that indicates that the value of decorated accessor (either field or "getter" method)
 * is to be used as the single value to serialize for the instance,
 * instead of the usual method of collecting properties of value.
 *
 * At most one accessor of a Class can be decorated with this decorator;
 * if more than one is found, an exception may be thrown.
 *
 * @example
 * ```typescript
 * class Company {
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   name: string;
 *   @JsonProperty()
 *   @JsonClassType({type: () => [Array, [Employee]]})
 *   employees: Employee[] = [];
 * }
 *
 * class Employee {
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   name: string;
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
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
