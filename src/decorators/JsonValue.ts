/**
 * @packageDocumentation
 * @module Decorators
 */

import {makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonValueDecorator, JsonValueOptions} from '../@types';
import {JsonValuePrivateOptions} from '../@types/private';
import {JacksonError} from '../core/JacksonError';

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
export const JsonValue: JsonValueDecorator = makeJacksonDecorator(
  (o: JsonValueOptions): JsonValueOptions => ({enabled: true, ...o}),
  (options: JsonValueOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (typeof descriptorOrParamIndex !== 'number') {
      if (Reflect.hasMetadata('jackson:JsonValue', target.constructor)) {
        throw new JacksonError(`Multiple @JsonValue() decorators for ${target.constructor}.'`);
      }

      const privateOptions: JsonValuePrivateOptions = {
        propertyKey: propertyKey.toString(),
        ...options
      };
      Reflect.defineMetadata('jackson:JsonValue', privateOptions, target.constructor);
    }
  });
