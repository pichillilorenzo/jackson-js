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
    private propagateAnnotations;
    private invokeCustomDeserializers;
    private getInstanceAlreadySeen;
    private parseJsonCreator;
    private parseJsonPropertyAndJsonAlias;
    private parseJsonRawValue;
    private parseJsonRootName;
    private parseJsonClass;
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
