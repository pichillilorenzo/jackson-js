/**
 * @packageDocumentation
 * @module Core
 */
import { JsonStringifierContext } from '../@types';
/**
 * JsonStringifier provides functionality for writing JSON.
 * It is also highly customizable to work both with different styles of JSON content,
 * and to support more advanced Object concepts such as polymorphism and Object identity.
 */
export declare class JsonStringifier<T> {
    /**
     * WeakMap used to track all objects by {@link JsonIdentityInfo}.
     */
    private _globalValueAlreadySeen;
    /**
     * Integer sequence generator counter used by {@link JsonIdentityInfo}.
     */
    private _intSequenceGenerator;
    /**
     *
     */
    constructor();
    /**
     * Method for serializing a JavaScript object or a value to a JSON string.
     *
     * @param obj - the JavaScript object or value to be serialized.
     * @param context - the context to be used during serialization.
     */
    stringify(obj: T, context?: JsonStringifierContext): string;
    /**
     * Method for applying json decorators to a JavaScript object/value.
     * It returns a JavaScript object/value with json decorators applied and ready to be JSON serialized.
     *
     * @param value - the JavaScript object or value to be preprocessed.
     * @param context - the context to be used during serialization preprocessing.
     */
    transform(value: any, context?: JsonStringifierContext): any;
    /**
     * Recursive {@link JsonStringifier.transform}.
     *
     * @param key - key name representing the object property being preprocessed.
     * @param value - the JavaScript object or value to preprocessed.
     * @param context - the context to be used during serialization preprocessing.
     * @param valueAlreadySeen - Map used to manage object circular references.
     */
    private deepTransform;
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
    private stringifyMapAndObjLiteral;
    /**
     *
     * @param filter
     * @param key
     * @param context
     */
    private isPropertyKeyExcludedByJsonFilter;
    /**
     *
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
     * @param key
     * @param context
     */
    private stringifyJsonNaming;
}
