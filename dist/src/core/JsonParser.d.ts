/**
 * @packageDocumentation
 * @module Core
 */
import { JsonParserContext, JsonParserTransformerContext } from '../@types';
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
     * @param context
     */
    parse(text: string, context?: JsonParserContext): T;
    /**
     *
     * @param key
     * @param value
     * @param context
     */
    transform(key: string, value: any, context: JsonParserTransformerContext): any;
    /**
     *
     * @param context
     */
    private convertParserContextToTransformerContext;
    /**
     *
     * @param context
     */
    private getDefaultValue;
    /**
     * Propagate decorators to class properties or parameters,
     * only for the first level (depth) of recursion.
     *
     * Used, for example, in case of decorators applied on an iterable, such as an Array.
     * In this case, the decorators are applied to each item of the iterable and not on the iterable itself.
     *
     * @param jsonClass
     * @param key
     * @param context
     * @param argumentMethodName
     * @param argumentIndex
     */
    private propagateDecorators;
    /**
     *
     * @param key
     * @param value
     * @param context
     */
    private invokeCustomDeserializers;
    /**
     *
     * @param key
     * @param value
     * @param context
     */
    private getInstanceAlreadySeen;
    /**
     *
     * @param context
     * @param obj
     */
    private parseJsonCreator;
    /**
     *
     * @param jsonCreator
     * @param method
     * @param obj
     * @param context
     */
    private parseJsonCreatorArguments;
    /**
     *
     * @param replacement
     * @param context
     */
    private parseJsonPropertyAndJsonAlias;
    /**
     *
     * @param context
     * @param replacement
     * @param key
     */
    private parseJsonRawValue;
    /**
     *
     * @param replacement
     * @param context
     */
    private parseJsonRootName;
    /**
     *
     * @param context
     * @param obj
     * @param key
     * @param argumentMethodName
     * @param argumentIndex
     */
    private parseJsonClass;
    /**
     *
     * @param mainCreator
     * @param context
     * @private
     */
    private _addInternalDecoratorsFromJsonClass;
    /**
     *
     * @param replacement
     * @param context
     * @param obj
     * @param key
     */
    private parseJsonManagedReference;
    /**
     *
     * @param replacement
     * @param obj
     * @param key
     * @param context
     */
    private parseJsonAnySetter;
    /**
     *
     * @param context
     * @param replacement
     */
    private parseJsonDeserializeClass;
    /**
     *
     * @param context
     * @param replacement
     * @param key
     */
    private parseJsonDeserializeProperty;
    /**
     *
     * @param context
     * @param key
     */
    private parseHasJsonIgnore;
    /**
     *
     * @param context
     */
    private parseJsonIgnoreType;
    /**
     *
     * @param obj
     * @param context
     */
    private parseJsonTypeInfo;
    /**
     *
     * @param context
     * @param key
     */
    private parseHasJsonView;
    /**
     *
     * @param replacement
     * @param context
     */
    private parseJsonUnwrapped;
    /**
     *
     * @param replacement
     * @param obj
     * @param context
     */
    private parseJsonIdentityInfo;
    /**
     *
     * @param iterable
     * @param key
     * @param context
     */
    private parseIterable;
    /**
     *
     * @param obj
     * @param context
     */
    private parseMap;
    /**
     *
     * @param scope
     * @param id
     */
    private generateScopedId;
    /**
     *
     * @param obj
     * @param context
     */
    private parseJsonNaming;
}
