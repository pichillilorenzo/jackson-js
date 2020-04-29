/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, hasMetadata, makeJacksonDecorator} from '../util';
import {JsonCreatorDecorator, JsonCreatorOptions} from '../@types';
import {JacksonError} from '../core/JacksonError';

/**
 * Default creator name used by {@link JsonCreator}.
 */
export const defaultCreatorName = 'defaultCreatorName';

/**
 * Property that is used to indicate how argument(s) is/are bound for creator (see {@link JsonCreator}).
 */
export enum JsonCreatorMode {
  /**
   * Mode that indicates that the argument(s) for creator are to be bound from matching properties of incoming
   * Object value, using creator argument names (explicit or implicit) to match incoming Object properties to arguments.
   */
  PROPERTIES,
  /**
   * Mode that indicates that if creator takes a single argument, the whole incoming data value is passed as the argument to creator.
   */
  DELEGATING
}

/**
 * Decorator that can be used to define constructors and factory methods
 * as one to use for instantiating new instances of the associated class.
 *
 * When decorating creator methods (constructors, factory methods), method must either be:
 * - Single-argument constructor/factory method without {@link JsonProperty} decorator for the argument:
 *   the whole incoming data value is passed as the argument to creator (see {@link JsonCreatorMode.DELEGATING});
 * - Constructor/factory method where every argument is bound from matching properties of incoming Object value,
 *   using creator argument names (explicit or implicit) to match incoming Object properties to arguments
 *   (see {@link JsonCreatorMode.PROPERTIES}).
 *
 *
 * @example
 * ```typescript
 * @JsonCreator()
 * class Employee {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   name: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   department: string;
 *
 *   constructor(id: number,
 *     @JsonProperty({value: 'empName'}) name: string,
 *     @JsonProperty({value: 'empDept'}) department: string) {
 *     this.id = id;
 *     this.name = name;
 *     this.department = department;
 *   }
 * }
 *
 * class Employee {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   name: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   department: string;
 *
 *   constructor(id: number, name: string, department: string) {
 *     this.id = id;
 *     this.name = name;
 *     this.department = department;
 *   }
 *
 *   @JsonCreator()
 *   static toEmployee(id: number,
 *     @JsonProperty({value: 'empName'}) name: string,
 *     @JsonProperty({value: 'empDept'}) department: string): Employee {
 *     return new Employee(id, name, department);
 *   }
 *
 *   @JsonCreator({name: 'AnotherEmployeeCreator'})
 *   static toAnotherEmployee(id: number,
 *     @JsonProperty({value: 'anotherEmpName'}) anotherName: string,
 *     @JsonProperty({value: 'anotherEmpDept'}) anotherDepartment: string): Employee {
 *     return new Employee(id, 'Another ' + anotherName, 'Another ' + anotherDepartment);
 *   }
 * }
 * ```
 */
export const JsonCreator: JsonCreatorDecorator = makeJacksonDecorator(
  (o: JsonCreatorOptions = {}): JsonCreatorOptions => ({
    enabled: true,
    name: defaultCreatorName,
    mode: JsonCreatorMode.PROPERTIES,
    ...o
  }),
  (options: JsonCreatorOptions, target, propertyKey, descriptorOrParamIndex) => {
    options._propertyKey = (options._propertyKey != null) ? options._propertyKey : 'constructor';

    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex !== 'number' &&
      typeof descriptorOrParamIndex.value === 'function') {
      options._method = descriptorOrParamIndex.value;
      if (options.name &&
        hasMetadata('JsonCreator:' + options.name, target, null, {withContextGroups: options.contextGroups})) {
        throw new JacksonError(`Already had a @JsonCreator() with name "${options.name}" for Class "${target.name}".`);
      }
      defineMetadata('JsonCreator', options, target, null, {
        suffix: options.name
      });
    } else if (descriptorOrParamIndex == null && propertyKey == null) {
      options._ctor = target;
      // get original constructor
      while (options._ctor.toString().trim().startsWith('class extends target {')) {
        options._ctor = Object.getPrototypeOf(options._ctor);
      }

      defineMetadata('JsonCreator', options, target, null, {
        suffix: options.name
      });
      return target;
    }
  });
