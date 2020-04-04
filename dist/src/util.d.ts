import { ClassType, JsonAnnotationDecorator, JsonAnnotationOptions, JsonStringifierParserCommonOptions } from './@types';
import 'reflect-metadata';
/**
 * https://stackoverflow.com/a/43197340/4637638
 */
export declare const isClass: (obj: any) => boolean;
/**
 * https://stackoverflow.com/a/56035104/4637638
 */
export declare const isFunction: (funcOrClass: any) => boolean;
export declare const makeDecorator: <T>(options: (...args: any[]) => JsonAnnotationOptions, decorator: JsonAnnotationDecorator) => any;
export declare const makeJacksonDecorator: <T>(options: (...args: any[]) => JsonAnnotationOptions, decorator: JsonAnnotationDecorator) => any;
export declare const getClassProperties: (target: Record<string, any>, options?: {
    withJsonProperties: boolean;
    withJsonAliases: boolean;
}) => string[];
export declare const classHasOwnProperty: (target: Record<string, any>, propertyKey: string, options?: JsonStringifierParserCommonOptions<any>) => boolean;
export declare const getArgumentNames: (method: any) => string[];
export declare const isSameConstructor: (ctorOrCtorName: any, ctor2: any) => boolean;
export declare const isExtensionOf: (ctor: any, ctorExtensionOf: any) => boolean;
export declare const isSameConstructorOrExtensionOf: (ctorOrCtorName: any, ctor2: any) => boolean;
export declare const isSameConstructorOrExtensionOfNoObject: (ctorOrCtorName: any, ctor2: any) => boolean;
export declare const hasIterationProtocol: (variable: any) => boolean;
export declare const isIterableNoMapNoString: (variable: any) => boolean;
export declare const isIterableNoString: (variable: any) => boolean;
export declare const isClassIterableNoMap: (ctor: ClassType<any>) => boolean;
export declare const isClassIterableNoMapNoString: (ctor: ClassType<any>) => boolean;
export declare const isClassIterable: (ctor: ClassType<any>) => boolean;
/**
 * https://stackoverflow.com/a/1482209/4637638
 */
export declare const isObjLiteral: (_obj: any) => boolean;
/**
 * https://stackoverflow.com/a/3886106/4637638
 */
export declare const isInt: (n: number) => boolean;
export declare const isFloat: (n: number) => boolean;
export declare const findMetadata: <T extends JsonAnnotationOptions>(metadataKey: string, target: Record<string, any>, propertyKey?: string | symbol, options?: JsonStringifierParserCommonOptions<any>) => T;
export declare const getMetadata: <T extends JsonAnnotationOptions>(metadataKey: string, target: Record<string, any>, propertyKey?: string | symbol, options?: JsonStringifierParserCommonOptions<any>) => T;
export declare const findMetadataKeys: <T extends JsonAnnotationOptions>(target: Record<string, any>, options?: JsonStringifierParserCommonOptions<any>) => any[];
export declare const getMetadataKeys: <T extends JsonAnnotationOptions>(target: Record<string, any>, options?: JsonStringifierParserCommonOptions<any>) => any[];
export declare const hasMetadata: <T extends JsonAnnotationOptions>(metadataKey: string, target: Record<string, any>, propertyKey?: string | symbol, options?: JsonStringifierParserCommonOptions<any>) => boolean;
export declare const isVariablePrimitiveType: (value: any) => boolean;
export declare const isConstructorPrimitiveType: (ctor: any) => boolean;
export declare const getDefaultPrimitiveTypeValue: (ctor: ClassType<any>) => any;
export declare const getDefaultValue: (value: any) => any;
export declare const isValueEmpty: (value: any) => boolean;
export declare const getDeepestClass: (array: any[]) => any;
export declare const getObjectKeysWithPropertyDescriptorNames: (obj: any) => string[];
export declare const objectHasOwnPropertyWithPropertyDescriptorNames: (obj: any, key: string) => boolean;
