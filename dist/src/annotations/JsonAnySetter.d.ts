import 'reflect-metadata';
import { JsonAnySetterDecorator } from '../@types';
/**
 * Marker annotation that can be used to define a logical "any setter" mutator using non-static two-argument method
 * (first argument name of property, second value to set) to be used as a "fallback" handler
 * for all otherwise unrecognized properties found from JSON content.
 *
 * If used, all otherwise unmapped key-value pairs from JSON Object values are added using mutator.
 *
 * @Annotation
 * @param options - {@link JsonAnySetterOptions}
 */
export declare const JsonAnySetter: JsonAnySetterDecorator;
