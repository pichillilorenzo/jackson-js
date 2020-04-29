/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonCreatorDecorator } from '../@types';
/**
 * Default creator name used by {@link JsonCreator}.
 */
export declare const defaultCreatorName = "defaultCreatorName";
/**
 * Property that is used to indicate how argument(s) is/are bound for creator (see {@link JsonCreator}).
 */
export declare enum JsonCreatorMode {
    /**
     * Mode that indicates that the argument(s) for creator are to be bound from matching properties of incoming
     * Object value, using creator argument names (explicit or implicit) to match incoming Object properties to arguments.
     */
    PROPERTIES = 0,
    /**
     * Mode that indicates that if creator takes a single argument, the whole incoming data value is passed as the argument to creator.
     */
    DELEGATING = 1
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
export declare const JsonCreator: JsonCreatorDecorator;
