/**
 * @packageDocumentation
 * @module Decorators
 */
import 'reflect-metadata';
import { JsonSetterDecorator } from '../@types';
/**
 * Used with {@link JsonSetter} (for properties `nulls` and `contentNulls`) to define
 * how explicit `null` values from input are handled.
 */
export declare enum JsonSetterNulls {
    /**
     * Value that indicates that an exception (of type that indicates input mismatch problem)
     * is to be thrown, to indicate that null values are not accepted.
     */
    FAIL = 0,
    /**
     * Value that indicates that an input null should result in assignment of JavaScript `null`value
     * of matching property.
     */
    SET = 1,
    /**
     * Value that indicates that an input null value should be skipped and no assignment is to be made.
     */
    SKIP = 2
}
/**
 * Decorator that can be used to define a non-static, single-argument method to be used as a "setter"
 * for a logical property as an alternative to recommended {@link JsonProperty} annotation.
 *
 * Setter means that when deserializing Object instance of class that has this method
 * (possibly inherited from a super class), a call is made through the method.
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
export declare const JsonSetter: JsonSetterDecorator;
