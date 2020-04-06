import 'reflect-metadata';
import { JsonAliasDecorator } from '../@types';
/**
 * Annotation that can be used to define one or more alternative names for a property,
 * accepted during deserialization as alternative to the official name.
 * Has no effect during serialization where primary name is always used.
 *
 * @Annotation
 * @param options - {@link JsonAliasOptions}
 */
export declare const JsonAlias: JsonAliasDecorator;
