/// <reference types="node" />
import { JsonTypeInfoAs, JsonTypeInfoId } from '../annotations/JsonTypeInfo';
import { JsonIncludeType } from '../annotations/JsonInclude';
import { JsonFormatShape } from '../annotations/JsonFormat';
import { JsonPropertyAccess } from '../annotations/JsonProperty';
import { ObjectIdGenerator } from '../annotations/JsonIdentityInfo';
export declare type ClassType<T> = (new () => T) | (new (...args: any[]) => T) | ((...args: any[]) => T) | ((...args: any[]) => ((cls: any) => T));
export declare type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' | 'unshift';
export declare type FixedLengthArray<T, L extends number, TObj = [T, ...Array<T>]> = Pick<TObj, Exclude<keyof TObj, ArrayLengthMutationKeys>> & {
    [I: number]: T;
    readonly length: L;
    [Symbol.iterator]: () => IterableIterator<T>;
};
export interface ClassList<T> extends Array<any> {
    [index: number]: T | ClassList<T>;
    0: T;
}
export interface JsonStringifierOptions {
    withView?: (...args: any[]) => ClassType<any>;
    format?: string;
    features?: {
        [key: number]: boolean;
    };
    serializers?: ObjectMapperSerializer[];
}
export interface JsonParserOptions {
    mainCreator?: (...args: any[]) => ClassList<ClassType<any>>;
    withView?: (...args: any[]) => ClassType<any>;
    features?: {
        [key: number]: boolean;
    };
    deserializers?: ObjectMapperDeserializer[];
}
export declare type Serializer = (key: string, value: any) => any;
export declare type Deserializer = (key: string, value: any) => any;
export interface ObjectMapperFeatures {
    serialization: {
        [key: number]: boolean;
    };
    deserialization: {
        [key: number]: boolean;
    };
}
export interface ObjectMapperCustomMapper<T> {
    mapper: T;
    type?: any;
    order?: number;
}
export declare type ObjectMapperSerializer = ObjectMapperCustomMapper<Serializer>;
export declare type ObjectMapperDeserializer = ObjectMapperCustomMapper<Deserializer>;
export interface JsonAnnotationOptions {
    enabled?: boolean;
}
export declare type JsonAnnotationDecorator = <T>(options: JsonAnnotationOptions, target: Record<string, any>, propertyKey: string | symbol, descriptorOrParamIndex: number | TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
export interface JsonAnyGetterOptions extends JsonAnnotationOptions {
    for?: string;
}
export declare type JsonAnySetterOptions = JsonAnnotationOptions;
export interface JsonBackReferenceOptions extends JsonAnnotationOptions {
    value?: string;
}
export interface JsonCreatorOptions extends JsonAnnotationOptions {
    properties?: {};
}
export interface JsonDeserializeOptions extends JsonAnnotationOptions {
    using?: (...args: any[]) => any;
}
export interface JsonFormatOptions extends JsonAnnotationOptions {
    shape?: JsonFormatShape;
    pattern?: string;
    locale?: string;
    timezone?: string | Intl.DateTimeFormatOptions;
}
export declare type JsonIgnoreOptions = JsonAnnotationOptions;
export interface JsonIgnorePropertiesOptions extends JsonAnnotationOptions {
    value?: string[];
    allowGetters?: boolean;
    allowSetters?: boolean;
    ignoreUnknown?: boolean;
}
export declare type JsonIgnoreTypeOptions = JsonAnnotationOptions;
export interface JsonIncludeOptions extends JsonAnnotationOptions {
    value?: JsonIncludeType;
}
export interface JsonManagedReferenceOptions extends JsonAnnotationOptions {
    value?: string;
}
export interface JsonPropertyOptions extends JsonAnnotationOptions {
    class?: (...args: any[]) => ClassType<any>;
    value?: any;
    defaultValue?: any;
    access?: JsonPropertyAccess;
    required?: boolean;
}
export interface JsonPropertyOrderOptions extends JsonAnnotationOptions {
    alphabetic?: boolean;
    value?: string[];
}
export declare type JsonRawValueOptions = JsonAnnotationOptions;
export interface JsonRootNameOptions extends JsonAnnotationOptions {
    value?: string;
}
export interface JsonSerializeOptions extends JsonAnnotationOptions {
    using: (...args: any[]) => any;
}
export interface JsonSubTypeOptions extends JsonAnnotationOptions {
    class: (...args: any[]) => ClassType<any>;
    name?: string;
}
export interface JsonSubTypesOptions extends JsonAnnotationOptions {
    types: JsonSubTypeOptions[];
}
export interface JsonTypeInfoOptions extends JsonAnnotationOptions {
    use: JsonTypeInfoId;
    include: JsonTypeInfoAs;
    property?: string;
}
export interface JsonTypeNameOptions extends JsonAnnotationOptions {
    value?: string;
}
export declare type JsonValueOptions = JsonAnnotationOptions;
export interface JsonViewOptions extends JsonAnnotationOptions {
    value?: (...args: any[]) => ClassType<any>[];
}
export interface JsonAliasOptions extends JsonAnnotationOptions {
    values: string[];
}
export interface JsonClassOptions extends JsonAnnotationOptions {
    class: (...args: any[]) => ClassList<ClassType<any>>;
}
export interface JsonUnwrappedOptions extends JsonAnnotationOptions {
    prefix?: string;
    suffix?: string;
}
export interface UUIDv5GeneratorOptions {
    name?: string | Array<any>;
    namespace?: string | FixedLengthArray<number, 16>;
    buffer?: Array<any> | Buffer;
    offset?: number;
}
export interface UUIDv4GeneratorOptions {
    options?: {
        random?: FixedLengthArray<number, 16>;
        rng?: () => FixedLengthArray<number, 16>;
    };
    buffer?: Array<any> | Buffer;
    offset?: number;
}
export interface UUIDv3GeneratorOptions {
    name?: string | Array<any>;
    namespace?: string | FixedLengthArray<number, 16>;
    buffer?: Array<any> | Buffer;
    offset?: number;
}
export interface UUIDv1GeneratorOptions {
    options?: {
        node?: FixedLengthArray<number, 6>;
        clockseq?: number;
        msecs?: number;
        nsecs?: number;
        random?: FixedLengthArray<number, 16>;
        rng?: () => FixedLengthArray<number, 16>;
    };
    buffer?: Array<any> | Buffer;
    offset?: number;
}
export interface JsonIdentityInfoOptions extends JsonAnnotationOptions {
    generator: ObjectIdGenerator | ((obj: any) => any);
    property?: string;
    scope?: string;
    uuidv5?: UUIDv5GeneratorOptions;
    uuidv4?: UUIDv4GeneratorOptions;
    uuidv3?: UUIDv3GeneratorOptions;
    uuidv1?: UUIDv1GeneratorOptions;
}
