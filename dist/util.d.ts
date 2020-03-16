import { ClassType, JsonAnnotationDecorator, JsonAnnotationOptions } from './@types';
/**
 * https://stackoverflow.com/a/43197340/4637638
 */
export declare const isClass: (obj: any) => boolean;
export declare const makeDecorator: <T>(options: (...args: any[]) => JsonAnnotationOptions, decorator: JsonAnnotationDecorator) => any;
export declare const makeJacksonDecorator: <T>(options: (...args: any[]) => JsonAnnotationOptions, decorator: JsonAnnotationDecorator) => any;
export declare const getArgumentNames: (method: any, useFlow?: boolean) => string[];
export declare const cloneClassInstance: <T>(instance: any) => T;
export declare const isSameConstructor: (ctorOrCtorName: any, ctor2: any) => boolean;
export declare const isExtensionOf: (ctor: any, ctorExtensionOf: any) => boolean;
export declare const isSameConstructorOrExtensionOf: (ctorOrCtorName: any, ctor2: any) => boolean;
export declare const hasIterationProtocol: (variable: any) => boolean;
export declare const isIterableNoString: (variable: any) => boolean;
export declare const isClassIterable: (ctor: ClassType<any>) => boolean;
/**
 * https://stackoverflow.com/a/1482209/4637638
 */
export declare const isObjLiteral: (_obj: any) => boolean;
