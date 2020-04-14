/**
 * @packageDocumentation
 * @module Core
 */
import { JsonStringifierContext, JsonStringifierTransformerContext } from '../@types';
/**
 *
 */
export declare class JsonStringifier<T> {
    /**
     * WeakMap used to track all objects about @JsonIdentityInfo()
     */
    private _globalValueAlreadySeen;
    /**
     *
     */
    private _intSequenceGenerator;
    /**
     *
     */
    constructor();
    /**
     *
     * @param obj
     * @param context
     */
    stringify(obj: T, context?: JsonStringifierContext): string;
    /**
     *
     * @param key
     * @param value
     * @param context
     * @param valueAlreadySeen: Map used to manage object circular references
     */
    transform(key: string, value: any, context?: JsonStringifierTransformerContext, valueAlreadySeen?: Map<any, any>): any;
    /**
     *
     * @param key
     * @param value
     * @param context
     * @param valueAlreadySeen: Map used to manage object circular references
     */
    deepTransform(key: string, value: any, context: JsonStringifierTransformerContext, valueAlreadySeen: Map<any, any>): any;
    /**
     *
     * @param context
     */
    private convertStringifierContextToTransformerContext;
    /**
     *
     * @param key
     * @param value
     * @param context
     */
    private invokeCustomSerializers;
    /**
     *
     * @param context
     */
    private getDefaultValue;
    /**
     * Propagate decorators to class properties,
     * only for the first level (depth) of recursion.
     *
     * Used, for example, in case of decorators applied on an iterable, such as an Array.
     * In this case, the decorators are applied to each item of the iterable and not on the iterable itself.JsonFormat
     * @param obj
     * @param key
     * @param context
     */
    private propagateDecorators;
    /**
     *
     * @param obj
     * @param key
     * @param context
     */
    private stringifyJsonGetter;
    /**
     *
     * @param replacement
     * @param obj
     * @param context
     */
    private stringifyJsonAnyGetter;
    /**
     *
     * @param keys
     * @param context
     */
    private stringifyJsonPropertyOrder;
    /**
     *
     * @param oldKey
     * @param context
     */
    private stringifyIsIgnoredByJsonPropertyAccess;
    /**
     *
     * @param replacement
     * @param obj
     * @param oldKey
     * @param newKey
     * @param context
     * @param namingMap
     */
    private stringifyJsonVirtualProperty;
    /**
     *
     * @param replacement
     * @param obj
     * @param oldKey
     * @param newKey
     * @param context
     */
    private stringifyJsonRawValue;
    /**
     *
     * @param obj
     * @param context
     */
    private stringifyJsonValue;
    /**
     *
     * @param replacement
     * @param obj
     * @param context
     */
    private stringifyJsonRootName;
    /**
     *
     * @param obj
     * @param context
     */
    private stringifyJsonSerializeClass;
    /**
     *
     * @param replacement
     * @param obj
     * @param oldKey
     * @param newKey
     * @param context
     */
    private stringifyJsonSerializeProperty;
    /**
     *
     * @param replacement
     * @param oldKey
     * @param newKey
     * @param context
     */
    private stringifyJsonSerializePropertyNull;
    /**
     *
     * @param replacement
     * @param oldKey
     * @param newKey
     * @param context
     */
    private stringifyJsonSerializeMap;
    /**
     *
     * @param obj
     * @param key
     * @param context
     */
    private stringifyHasJsonIgnore;
    /**
     *
     * @param obj
     * @param key
     * @param context
     */
    private stringifyJsonInclude;
    /**
     *
     * @param replacement
     * @param key
     * @param context
     */
    private stringifyJsonIncludeMap;
    /**
     *
     * @param obj
     * @param context
     */
    private stringifyJsonIgnoreType;
    /**
     *
     * @param obj
     * @param key
     * @param context
     */
    private stringifyHasJsonBackReference;
    /**
     *
     * @param replacement
     * @param obj
     * @param context
     */
    private stringifyJsonTypeInfo;
    /**
     *
     * @param replacement
     * @param obj
     * @param oldKey
     * @param newKey
     * @param context
     */
    private stringifyJsonFormatProperty;
    /**
     *
     * @param obj
     * @param context
     */
    private stringifyJsonFormatClass;
    /**
     *
     * @param jsonFormat
     * @param replacement
     * @param context
     */
    private stringifyJsonFormat;
    /**
     *
     * @param obj
     * @param key
     * @param context
     */
    private stringifyHasJsonView;
    /**
     *
     * @param replacement
     * @param obj
     * @param key
     * @param context
     * @param valueAlreadySeen
     */
    private stringifyJsonUnwrapped;
    /**
     *
     * @param replacement
     * @param obj
     * @param context
     */
    private stringifyJsonIdentityInfo;
    /**
     *
     * @param obj
     * @param context
     */
    private hasJsonIdentityReferenceAlwaysAsId;
    /**
     *
     * @param replacement
     * @param obj
     * @param context
     */
    private stringifyJsonIdentityReference;
    /**
     *
     * @param key
     * @param iterableNoString
     * @param context
     * @param valueAlreadySeen
     */
    private stringifyIterable;
    /**
     *
     * @param map
     * @param context
     */
    private stringifyMap;
    /**
     *
     * @param filter
     * @param obj
     * @param key
     * @param context
     */
    private isPropertyKeyExcludedByJsonFilter;
    /**
     *
     * @param obj
     * @param key
     * @param context
     */
    private stringifyIsPropertyKeyExcludedByJsonFilter;
    /**
     *
     * @param replacement
     * @param obj
     * @param oldKey
     * @param newKey
     * @param context
     */
    private stringifyJsonFilter;
    /**
     *
     * @param obj
     * @param context
     */
    private isPrependJsonAppend;
    /**
     *
     * @param replacement
     * @param obj
     * @param context
     */
    private stringifyJsonAppend;
    /**
     *
     * @param replacement
     * @param obj
     * @param key
     * @param context
     */
    private stringifyJsonNaming;
}
