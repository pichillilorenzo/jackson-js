import { JsonParserOptions } from '../@types';
export declare class JsonParser<T> {
    private _globalValueAlreadySeen;
    constructor();
    parse(text: string, options?: JsonParserOptions): T;
    invokeCustomDeserializers(key: string, value: any, options: JsonParserOptions): any;
    parseJsonCreator(options: JsonParserOptions, obj: any): any;
    parseJsonPropertyAndJsonAlias(replacement: any, options: JsonParserOptions): void;
    parseJsonRawValue(options: JsonParserOptions, replacement: any, key: string): void;
    parseJsonRootName(replacement: any, options: JsonParserOptions): any;
    parseJsonClass(options: JsonParserOptions, obj: any, key: string): any;
    parseJsonReferences(replacement: any, options: JsonParserOptions, obj: any, key: string): any;
    parseJsonManagedReference(replacement: any, options: JsonParserOptions, obj: any, key: string): void;
    parseJsonAnySetter(replacement: any, value: any, key: string): void;
    parseJsonDeserialize(options: JsonParserOptions, replacement: any, key: string): void;
    parseHasJsonIgnore(options: JsonParserOptions, key: string): boolean;
    parseJsonIgnoreType(options: JsonParserOptions): boolean;
    parseJsonTypeInfo(obj: any, options: JsonParserOptions): any;
    parseHasJsonView(options: JsonParserOptions, key: string): boolean;
    parseJsonUnwrapped(replacement: any, options: JsonParserOptions): void;
    getInstanceAlreadySeen(obj: any, options: JsonParserOptions): null | any;
    parseJsonIdentityInfo(replacement: any, obj: any, options: JsonParserOptions): void;
    parseIterable(iterable: any, key: string, options: JsonParserOptions): any;
    private deepParse;
}
