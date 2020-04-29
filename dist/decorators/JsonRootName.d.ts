/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonRootNameDecorator } from '../@types';
/**
 * Decorator used to indicate name to use for root-level wrapping, if wrapping is enabled
 * (see {@link SerializationFeature.WRAP_ROOT_VALUE} and {@link DeserializationFeature.UNWRAP_ROOT_VALUE}).
 * Decorator itself does not indicate that wrapping should be used;
 * but if it is, name used for serialization should be name specified here, and deserializer will expect the name as well.
 *
 * @example
 * ```typescript
 * @JsonRootName()
 * class User {
 *    @JsonProperty() @JsonClassType({type: () => [Number]})
 *    id: number;
 *    @JsonProperty() @JsonClassType({type: () => [String]})
 *    email: string;
 *
 *    constructor(id: number, email: string) {
 *      this.id = id;
 *      this.email = email;
 *    }
 *  }
 *
 * const user = new User(1, 'john.alfa@gmail.com');
 *
 * const objectMapper = new ObjectMapper();
 * objectMapper.features.serialization.WRAP_ROOT_VALUE = true;
 * objectMapper.features.deserialization.UNWRAP_ROOT_VALUE = true;
 *
 * const jsonData = objectMapper.stringify<User>(user);
 *
 * const userParsed = objectMapper.parse<User>(jsonData, {mainCreator: () => [User]});
 * ```
 */
export declare const JsonRootName: JsonRootNameDecorator;
