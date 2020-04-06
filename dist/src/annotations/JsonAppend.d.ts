import 'reflect-metadata';
import { JsonAppendDecorator } from '../@types';
/**
 * Annotation that may be used to add "virtual" properties to be written after regular properties
 * (although ordering may be changed using both standard @JsonPropertyOrder annotation, and properties of this annotation).
 *
 * @Annotation
 * @param options - {@link JsonAppendOptions}
 */
export declare const JsonAppend: JsonAppendDecorator;
