import { JsonStringifierOptions, JsonStringifierTransformerOptions } from '../@types';
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
     * @param options
     */
    stringify(obj: T, options?: JsonStringifierOptions): string;
    /**
     *
     * @param key
     * @param value
     * @param options
     * @param valueAlreadySeen: Map used to manage object circular references
     */
    transform(key: string, value: any, options: JsonStringifierTransformerOptions, valueAlreadySeen: Map<any, any>): any;
    private invokeCustomSerializers;
    private getDefaultValue;
    /**
     * Propagate annotations to class properties,
     * only for the first level (depth) of recursion.
     *
     * Used, for example, in case of annotations applied on an iterable, such as an Array.
     * In this case, the annotations are applied to each item of the iterable and not on the iterable itself.JsonFormat
     * @param obj
     * @param key
     * @param options
     */
    private propagateAnnotations;
    private stringifyJsonGetter;
    private stringifyJsonAnyGetter;
    private stringifyJsonPropertyOrder;
    private stringifyJsonProperty;
    private stringifyJsonRawValue;
    private stringifyJsonValue;
    private stringifyJsonRootName;
    private stringifyJsonSerializeClass;
    private stringifyJsonSerializeProperty;
    private stringifyHasJsonIgnore;
    private stringifyJsonInclude;
    private stringifyJsonIgnoreType;
    private stringifyHasJsonBackReference;
    private stringifyJsonTypeInfo;
    private stringifyPropertyJsonFormat;
    private stringifyClassJsonFormat;
    private stringifyJsonFormat;
    private stringifyHasJsonView;
    private stringifyJsonUnwrapped;
    private stringifyJsonIdentityInfo;
    private hasJsonIdentityReferenceAlwaysAsId;
    private stringifyJsonIdentityReference;
    private stringifyIterable;
    private stringifyMap;
    private isPropertyKeyExcludedByJsonFilter;
    private stringifyIsPropertyKeyExcludedByJsonFilter;
    private stringifyJsonFilter;
    private isPrependJsonAppend;
    private stringifyJsonAppend;
    private stringifyJsonNaming;
}
