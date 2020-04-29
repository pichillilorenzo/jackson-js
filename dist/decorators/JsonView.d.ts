/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonViewDecorator } from '../@types';
/**
 * Decorator used for indicating view(s) that the property that is defined by method or field decorated is part of.
 * If multiple View class identifiers are included, property will be part of all of them.
 *
 * It is also possible to use this decorator on classes to indicate the default view(s)
 * for properties of the type, unless overridden by per-property decorator.
 *
 * @example
 * ```typescript
 * class Views {
 *   static public = class Public {};
 *   static internal = class Internal {};
 * }
 *
 * class User {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   email: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   @JsonView({value: () => [Views.internal]})
 *   password: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   firstname: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   lastname: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   @JsonView({value: () => [Views.internal]})
 *   activationCode: string;
 *
 *   constructor(id: number, email: string, password: string, firstname: string, lastname: string, activationCode: string) {
 *     this.id = id;
 *     this.email = email;
 *     this.password = password;
 *     this.firstname = firstname;
 *     this.lastname = lastname;
 *     this.activationCode = activationCode;
 *   }
 * }
 *
 * const user = new User(1, 'john.alfa@gmail.com', 'rtJ9FrqP!rCE', 'John', 'Alfa', '75afe654-695e-11ea-bc55-0242ac130003');
 *
 * const objectMapper = new ObjectMapper();
 *
 * const jsonDataWithViewPublic = objectMapper.stringify<User>(user, {
 *   withViews: () => [Views.public]
 * });
 * ```
 */
export declare const JsonView: JsonViewDecorator;
