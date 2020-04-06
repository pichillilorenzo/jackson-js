import 'reflect-metadata';
import { JsonAnyGetterDecorator } from '../@types';
/**
 * Marker annotation that can be used to define a non-static, no-argument method to be an "any getter";
 * accessor for getting a set of key/value pairs, to be serialized as part of containing Class (similar to unwrapping)
 * along with regular property values it has.
 * This typically serves as a counterpart to "any setter" mutators @see {@link JsonAnySetter}.
 * Note that the return type of annotated methods must be a {@link Map} or an "Object Literal").
 *
 * As with JsonAnySetter, only one property should be annotated with this annotation;
 * if multiple methods are annotated, an exception may be thrown.
 *
 * @Annotation
 * @param options - {@link JsonAnyGetterOptions}
 */
export declare const JsonAnyGetter: JsonAnyGetterDecorator;
