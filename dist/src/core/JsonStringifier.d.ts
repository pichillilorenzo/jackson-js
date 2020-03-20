import { ClassList, ClassType, JsonStringifierOptions } from '../@types';
export interface JsonStringifierPrivateOptions extends JsonStringifierOptions {
    mainCreator: ClassList<ClassType<any>>;
}
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
    invokeCustomSerializers(key: string, value: any, options: JsonStringifierPrivateOptions): any;
    stringifyJsonAnyGetter(replacement: any, obj: any, oldKeys: string[]): string[];
    stringifyJsonPropertyOrder(obj: any): string[];
    stringifyJsonProperty(replacement: any, obj: any, key: string): void;
    stringifyJsonRawValue(replacement: any, obj: any, key: string): void;
    stringifyJsonValue(obj: any): null | any;
    stringifyJsonRootName(replacement: any, obj: any): any;
    stringifyJsonSerialize(replacement: any, obj: any, key: string): void;
    stringifyHasJsonIgnore(obj: any, key: string): boolean;
    stringifyJsonInclude(obj: any, key: string): boolean;
    stringifyJsonIgnoreType(obj: any): boolean;
    stringifyHasJsonBackReference(obj: any, key: string): boolean;
    stringifyJsonTypeInfo(replacement: any, obj: any): any;
    stringifyJsonFormat(replacement: any, obj: any, key: string): void;
    stringifyHasJsonView(obj: any, key: string, options: JsonStringifierPrivateOptions): boolean;
    stringifyJsonUnwrapped(replacement: any, obj: any, key: string, options: JsonStringifierPrivateOptions): void;
    stringifyJsonIdentityInfo(replacement: any, obj: any, key: string): void;
    stringifyIterable(key: string, iterableNoString: any, options: JsonStringifierPrivateOptions, valueAlreadySeen: Map<any, any>): any[];
    stringifyMap(map: Map<any, any>): any;
    /**
     *
     * @param key
     * @param value
     * @param options
     * @param valueAlreadySeen: Map used to manage object circular references
     */
    private deepStringify;
}
