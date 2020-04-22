/**
 * @packageDocumentation
 * @module Core
 */
import { JsonParserContext } from '../@types';
/**
 * JsonParser provides functionality for reading JSON.
 * It is also highly customizable to work both with different styles of JSON content,
 * and to support more advanced Object concepts such as polymorphism and Object identity.
 */
export declare class JsonParser<T> {
    /**
     * Map used to restore object circular references defined by {@link JsonIdentityInfo}.
     */
    private _globalValueAlreadySeen;
    /**
     * Map used to store unresolved object identities defined by {@link JsonIdentityInfo}.
     */
    private _globalUnresolvedObjectIdentities;
    /**
     *
     */
    constructor();
    /**
     * Method for deserializing a JSON string into a JavaScript object or value.
     *
     * @param text - the JSON string to be deserialized.
     * @param context - the context to be used during deserialization.
     */
    parse(text: string, context?: JsonParserContext): T;
    /**
     * Method for applying json decorators to a JavaScript object/value parsed.
     * It returns a JavaScript object/value with json decorators applied.
     *
     * @param value - the JavaScript object or value to be postprocessed.
     * @param context - the context to be used during deserialization postprocessing.
     */
    transform(value: any, context?: JsonParserContext): any;
    /**
     * Recursive {@link JsonParser.transform}.
     *
     * @param key - key name representing the object property being postprocessed.
     * @param value - the JavaScript object or value to postprocessed.
     * @param context - the context to be used during deserialization postprocessing.
     */
    private deepTransform;
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
     * @param methodName
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
    private parseJsonInject;
    private parseJsonSetter;
    /**
     *
     * @param methodName
     * @param method
     * @param obj
     * @param context
     * @param isJsonCreator
     */
    private parseMethodArguments;
    /**
     *
     * @param replacement
     * @param context
     */
    private parseJsonVirtualPropertyAndJsonAlias;
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
     * @param methodName
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
    private parseIsIncludedByJsonViewProperty;
    /**
     *
     * @param context
     * @param methodName
     * @param argumentIndex
     */
    private parseIsIncludedByJsonViewParam;
    /**
     *
     * @param jsonView
     * @param context
     */
    private parseIsIncludedByJsonView;
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
    private parseMapAndObjLiteral;
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
