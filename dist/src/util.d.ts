import { ClassType, JsonAnnotationDecorator, JsonAnnotationOptions } from './@types';
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
export declare const getClassProperties: (clazz: (new () => any) | (new (...args: any[]) => any) | ((...args: any[]) => any) | ((...args: any[]) => (cls: any) => any) | ObjectConstructor) => string[];
export declare const getArgumentNames: (method: any) => string[];
export declare const cloneClassInstance: <T>(instance: any) => T;
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
export declare const getMetadata: <T extends JsonAnnotationOptions>(metadataKey: string, target: Record<string, any>, propertyKey?: string | symbol, annotationsEnabled?: {
    [key: string]: any;
}) => T;
export declare const hasMetadata: <T extends JsonAnnotationOptions>(metadataKey: string, target: Record<string, any>, propertyKey?: string | symbol, annotationsEnabled?: {
    [key: string]: any;
}) => boolean;
export declare const isVariablePrimitiveType: (value: any) => boolean;
export declare const isConstructorPrimitiveType: (ctor: any) => boolean;
export declare const getDefaultPrimitiveTypeValue: (ctor: ClassType<any>) => any;
