import { JsonParserOptions, JsonParserTransformerOptions } from '../@types';
/**
 *
 */
export declare class JsonParser<T> {
    /**
     * Map used to restore object circular references defined with @JsonIdentityInfo()
     */
    private _globalValueAlreadySeen;
    private _globalUnresolvedValueAlreadySeen;
    /**
     *
     */
    constructor();
    /**
     *
     * @param text
     * @param options
     */
    parse(text: string, options?: JsonParserOptions): T;
    /**
     *
     * @param key
     * @param value
     * @param options
     */
    transform(key: string, value: any, options: JsonParserTransformerOptions): any;
    private convertParserOptionsToTransformerOptions;
    private getDefaultValue;
    /**
     * Propagate annotations to class properties or parameters,
     * only for the first level (depth) of recursion.
     *
     * Used, for example, in case of annotations applied on an iterable, such as an Array.
     * In this case, the annotations are applied to each item of the iterable and not on the iterable itself.
     * @param jsonClass
     * @param key
     * @param options
     * @param argumentMethodName
     * @param argumentIndex
     */
    private propagateAnnotations;
    private invokeCustomDeserializers;
    private getInstanceAlreadySeen;
    private parseJsonCreator;
    private parseJsonCreatorArguments;
    private parseJsonPropertyAndJsonAlias;
    private parseJsonRawValue;
    private parseJsonRootName;
    private parseJsonClass;
    private _addInternalAnnotationsFromJsonClass;
    private parseJsonManagedReference;
    private parseJsonAnySetter;
    private parseJsonDeserializeClass;
    private parseJsonDeserializeProperty;
    private parseHasJsonIgnore;
    private parseJsonIgnoreType;
    private parseJsonTypeInfo;
    private parseHasJsonView;
    private parseJsonUnwrapped;
    private parseJsonIdentityInfo;
    private parseIterable;
    private parseMap;
    private generateScopedId;
    private parseJsonNaming;
}
