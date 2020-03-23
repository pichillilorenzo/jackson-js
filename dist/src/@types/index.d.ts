/// <reference types="node" />
import { JsonTypeInfoAs, JsonTypeInfoId } from '../annotations/JsonTypeInfo';
import { JsonIncludeType } from '../annotations/JsonInclude';
import { JsonFormatShape } from '../annotations/JsonFormat';
import { JsonPropertyAccess } from '../annotations/JsonProperty';
import { ObjectIdGenerator } from '../annotations/JsonIdentityInfo';
import { JsonFilterType } from '../annotations/JsonFilter';
import { JsonNamingStrategy } from '../annotations/JsonNaming';
/**
 * https://stackoverflow.com/a/55032655/4637638
 */
export declare type Modify<T, R> = Omit<T, keyof R> & R;
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
export declare type JacksonDecoratorWithOptions<T extends JsonAnnotationOptions> = (options: T) => any;
export declare type JacksonDecoratorWithOptionalOptions<T extends JsonAnnotationOptions> = (options?: T) => any;
export declare type JacksonDecorator<T extends JsonAnnotationOptions> = JacksonDecoratorWithOptions<T> | JacksonDecoratorWithOptionalOptions<T>;
export declare type JsonAliasDecorator = JacksonDecoratorWithOptions<JsonAliasOptions>;
export declare type JsonAppendDecorator = JacksonDecoratorWithOptions<JsonAppendOptions>;
export declare type JsonClassDecorator = JacksonDecoratorWithOptions<JsonClassOptions>;
export declare type JsonDeserializeDecorator = JacksonDecoratorWithOptions<JsonDeserializeOptions>;
export declare type JsonFilterDecorator = JacksonDecoratorWithOptions<JsonFilterOptions>;
export declare type JsonIdentityInfoDecorator = JacksonDecoratorWithOptions<JsonIdentityInfoOptions>;
export declare type JsonIdentityReferenceDecorator = JacksonDecoratorWithOptions<JsonIdentityReferenceOptions>;
export declare type JsonNamingDecorator = JacksonDecoratorWithOptions<JsonNamingOptions>;
export declare type JsonSerializeDecorator = JacksonDecoratorWithOptions<JsonSerializeOptions>;
export declare type JsonSubTypesDecorator = JacksonDecoratorWithOptions<JsonSubTypesOptions>;
export declare type JsonTypeInfoDecorator = JacksonDecoratorWithOptions<JsonTypeInfoOptions>;
export declare type JsonAnyGetterDecorator = JacksonDecoratorWithOptionalOptions<JsonAnyGetterOptions>;
export declare type JsonAnySetterDecorator = JacksonDecoratorWithOptionalOptions<JsonAnySetterOptions>;
export declare type JsonBackReferenceDecorator = JacksonDecoratorWithOptionalOptions<JsonBackReferenceOptions>;
export declare type JsonCreatorDecorator = JacksonDecoratorWithOptionalOptions<JsonCreatorOptions>;
export declare type JsonFormatDecorator = JacksonDecoratorWithOptionalOptions<JsonFormatOptions>;
export declare type JsonIgnoreDecorator = JacksonDecoratorWithOptionalOptions<JsonIgnoreOptions>;
export declare type JsonIgnorePropertiesDecorator = JacksonDecoratorWithOptionalOptions<JsonIgnorePropertiesOptions>;
export declare type JsonIgnoreTypeDecorator = JacksonDecoratorWithOptionalOptions<JsonIgnoreTypeOptions>;
export declare type JsonIncludeDecorator = JacksonDecoratorWithOptionalOptions<JsonIncludeOptions>;
export declare type JsonInjectDecorator = JacksonDecoratorWithOptionalOptions<JsonInjectOptions>;
export declare type JsonManagedReferenceDecorator = JacksonDecoratorWithOptionalOptions<JsonManagedReferenceOptions>;
export declare type JsonPropertyDecorator = JacksonDecoratorWithOptionalOptions<JsonPropertyOptions>;
export declare type JsonPropertyOrderDecorator = JacksonDecoratorWithOptionalOptions<JsonPropertyOrderOptions>;
export declare type JsonRawValueDecorator = JacksonDecoratorWithOptionalOptions<JsonRawValueOptions>;
export declare type JsonRootNameDecorator = JacksonDecoratorWithOptionalOptions<JsonRootNameOptions>;
export declare type JsonTypeNameDecorator = JacksonDecoratorWithOptionalOptions<JsonTypeNameOptions>;
export declare type JsonUnwrappedDecorator = JacksonDecoratorWithOptionalOptions<JsonUnwrappedOptions>;
export declare type JsonValueDecorator = JacksonDecoratorWithOptionalOptions<JsonValueOptions>;
export declare type JsonViewDecorator = JacksonDecoratorWithOptionalOptions<JsonViewOptions>;
export interface JsonStringifierFilterOptions {
    type: JsonFilterType;
    values?: string[];
}
export interface JsonStringifierOptions {
    withViews?: (...args: any[]) => ClassType<any>[];
    format?: string;
    features?: {
        [key: number]: boolean;
    };
    serializers?: ObjectMapperSerializer[];
    filters?: {
        [key: string]: JsonStringifierFilterOptions;
    };
    attributes?: {
        [key: string]: any;
    };
    annotationsEnabled?: {
        [key: string]: boolean;
    };
    forType?: WeakMap<ClassType<any>, JsonStringifierOptions>;
}
export interface JsonParserBaseWithoutMainCreatorOptions {
    withViews?: (...args: any[]) => ClassType<any>[];
    withCreatorName?: string;
    features?: {
        [key: number]: boolean;
    };
    deserializers?: ObjectMapperDeserializer[];
    injectableValues?: {
        [key: string]: any;
    };
    annotationsEnabled?: {
        [key: string]: boolean;
    };
    forType?: WeakMap<ClassType<any>, JsonParserBaseWithoutMainCreatorOptions>;
}
export interface JsonParserOptions extends JsonParserBaseWithoutMainCreatorOptions {
    mainCreator?: (...args: any[]) => ClassList<ClassType<any>>;
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
    type?: (...args: any[]) => any;
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
    name?: string;
}
export interface JsonDeserializeOptions extends JsonAnnotationOptions {
    using: (...args: any[]) => any;
}
export interface JsonFormatBaseOptions extends JsonAnnotationOptions {
    shape?: JsonFormatShape;
}
export interface JsonFormatAny extends JsonFormatBaseOptions {
    shape: JsonFormatShape.ANY;
}
export interface JsonFormatArray extends JsonFormatBaseOptions {
    shape: JsonFormatShape.ARRAY;
}
export interface JsonFormatBoolean extends JsonFormatBaseOptions {
    shape: JsonFormatShape.BOOLEAN;
}
export interface JsonFormatNumberFloat extends JsonFormatBaseOptions {
    shape: JsonFormatShape.NUMBER_FLOAT;
}
export interface JsonFormatNumberInt extends JsonFormatBaseOptions {
    shape: JsonFormatShape.NUMBER_INT;
}
export interface JsonFormatObject extends JsonFormatBaseOptions {
    shape: JsonFormatShape.OBJECT;
}
export interface JsonFormatScalar extends JsonFormatBaseOptions {
    shape: JsonFormatShape.SCALAR;
}
export interface JsonFormatString extends JsonFormatBaseOptions {
    shape: JsonFormatShape.STRING;
    pattern?: string;
    locale?: string;
    timezone?: string;
    radix?: number;
    toExponential?: number;
    toFixed?: number;
    toPrecision?: number;
}
export declare type JsonFormatOptions = JsonFormatAny | JsonFormatArray | JsonFormatBoolean | JsonFormatNumberFloat | JsonFormatNumberInt | JsonFormatObject | JsonFormatScalar | JsonFormatString;
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
export interface JsonIdentityReferenceOptions extends JsonAnnotationOptions {
    alwaysAsId: boolean;
}
export interface JsonStringifierTransformerOptions extends JsonStringifierOptions {
    mainCreator: ClassList<ClassType<any>>;
}
export declare type JsonParserTransformerOptions = Modify<JsonParserOptions, {
    mainCreator: ClassList<ClassType<any>>;
}>;
export interface JsonInjectOptions extends JsonAnnotationOptions {
    value?: string;
    useInput?: boolean;
}
export interface JsonFilterOptions extends JsonAnnotationOptions {
    name: string;
}
export interface JsonAppendOptionsAttribute {
    value: string;
    propName?: string;
    required?: boolean;
    include?: JsonIncludeType;
}
export interface JsonAppendOptions extends JsonAnnotationOptions {
    prepend?: boolean;
    attrs?: JsonAppendOptionsAttribute[];
}
export interface JsonNamingOptions extends JsonAnnotationOptions {
    strategy: JsonNamingStrategy;
}
