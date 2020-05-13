/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonIdentityInfoDecorator } from '../@types';
/**
 * Generator to use for producing Object Identifier for objects.
 * To be able to use {@link JsonIdentityInfo} with any UUID {@link ObjectIdGenerator}, an UUID library needs to be set.
 * UUID library supported: {@link https://github.com/uuidjs/uuid}.
 */
export declare enum ObjectIdGenerator {
    /**
     * Simple sequence-number based generator, which uses basic integers (starting with value 1) as Object Identifiers.
     */
    IntSequenceGenerator = 0,
    /**
     * Used to allow explicitly specifying that no generator is used.
     */
    None = 1,
    /**
     * Used to denote case where Object Identifier to use comes from a Class property (getter method or field).
     * If so, value is written directly during serialization, and used as-is during deserialization.
     */
    PropertyGenerator = 2,
    /**
     * Implementation that just uses version 5 UUIDs as reliably unique identifiers.
     */
    UUIDv5Generator = 3,
    /**
     * Implementation that just uses version 4 UUIDs as reliably unique identifiers.
     */
    UUIDv4Generator = 4,
    /**
     * Implementation that just uses version 3 UUIDs as reliably unique identifiers.
     */
    UUIDv3Generator = 5,
    /**
     * Implementation that just uses version 1 UUIDs as reliably unique identifiers.
     */
    UUIDv1Generator = 6
}
/**
 * Decorator used for indicating that values of decorated type or property should be serializing
 * so that instances either contain additional object identifier (in addition actual object properties),
 * or as a reference that consists of an object id that refers to a full serialization.
 * In practice this is done by serializing the first instance as full object and object identity,
 * and other references to the object as reference values.
 *
 * **IMPORTANT NOTE**: To be able to use {@link JsonIdentityInfo} with any UUID {@link ObjectIdGenerator}, an UUID library needs to be set.
 * UUID libraries supported: {@link https://github.com/uuidjs/uuid}.
 *
 * @example
 * ```typescript
 * @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'User'})
 * class User {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   email: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   firstname: string;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   lastname: string;
 *
 *   @JsonProperty()
 *   @JsonClassType({type: () => [Array, [Item]]})
 *   items: Item[] = [];
 * }
 *
 * @JsonIdentityInfo({generator: ObjectIdGenerator.PropertyGenerator, property: 'id', scope: 'Item'})
 * class Item {
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   id: number;
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   name: string;
 *
 *   @JsonProperty()
 *   @JsonClassType({type: () => [User]})
 *   owner: User;
 * }
 * ```
 */
export declare const JsonIdentityInfo: JsonIdentityInfoDecorator;
