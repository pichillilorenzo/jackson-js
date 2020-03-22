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
    private stringifyJsonAnyGetter;
    private stringifyJsonPropertyOrder;
    private stringifyJsonProperty;
    private stringifyJsonRawValue;
    private stringifyJsonValue;
    private stringifyJsonRootName;
    private stringifyJsonSerialize;
    private stringifyHasJsonIgnore;
    private stringifyJsonInclude;
    private stringifyJsonIgnoreType;
    private stringifyHasJsonBackReference;
    private stringifyJsonTypeInfo;
    private stringifyJsonFormat;
    private stringifyHasJsonView;
    private stringifyJsonUnwrapped;
    private stringifyJsonIdentityInfo;
    private stringifyIterable;
    private stringifyMap;
    private isPropertyKeyExcludedByJsonFilter;
    private stringifyIsPropertyKeyExcludedByJsonFilter;
    private stringifyJsonFilter;
}
