/**
 * @packageDocumentation
 * @module Types
 */
/// <reference types="node" />
import { JsonTypeInfoAs, JsonTypeInfoId } from '../decorators/JsonTypeInfo';
import { JsonIncludeType } from '../decorators/JsonInclude';
import { JsonFormatShape } from '../decorators/JsonFormat';
import { JsonPropertyAccess } from '../decorators/JsonProperty';
import { ObjectIdGenerator } from '../decorators/JsonIdentityInfo';
import { JsonFilterType } from '../decorators/JsonFilter';
import { JsonNamingStrategy } from '../decorators/JsonNaming';
import { JsonCreatorMode } from "../decorators/JsonCreator";
export declare type ClassType<T> = (new () => T) | (new (...args: any[]) => T) | ((...args: any[]) => T) | ((...args: any[]) => ((cls: any) => T));
export interface ClassList<T> extends Array<any> {
    [index: number]: T | ClassList<T>;
    0: T;
}
/**
 * Decorator type with at least one required option.
 */
export declare type JacksonDecoratorWithOptions<T extends JsonDecoratorOptions, TDecorator> = (options: T) => TDecorator;
/**
 * Decorator type with optional options.
 */
export declare type JacksonDecoratorWithOptionalOptions<T extends JsonDecoratorOptions, TDecorator> = (options?: T) => TDecorator;
/**
 * Decorator type.
 */
export declare type JacksonDecorator<T extends JsonDecoratorOptions, TDecorator> = JacksonDecoratorWithOptions<T, TDecorator> | JacksonDecoratorWithOptionalOptions<T, TDecorator>;
/**
 * Decorator type for {@link JsonAlias}.
 */
export declare type JsonAliasDecorator = JacksonDecoratorWithOptions<JsonAliasOptions, PropertyDecorator & ParameterDecorator>;
/**
 * Decorator type for {@link JsonAppend}.
 */
export declare type JsonAppendDecorator = JacksonDecoratorWithOptions<JsonAppendOptions, ClassDecorator>;
/**
 * Decorator type for {@link JsonClass}.
 */
export declare type JsonClassDecorator = JacksonDecoratorWithOptions<JsonClassOptions, PropertyDecorator & ParameterDecorator>;
export declare type JsonDeserializeDecorator = JacksonDecoratorWithOptions<JsonDeserializeOptions, any>;
export declare type JsonFilterDecorator = JacksonDecoratorWithOptions<JsonFilterOptions, any>;
export declare type JsonIdentityInfoDecorator = JacksonDecoratorWithOptions<JsonIdentityInfoOptions, any>;
export declare type JsonIdentityReferenceDecorator = JacksonDecoratorWithOptions<JsonIdentityReferenceOptions, any>;
export declare type JsonNamingDecorator = JacksonDecoratorWithOptions<JsonNamingOptions, any>;
export declare type JsonSerializeDecorator = JacksonDecoratorWithOptions<JsonSerializeOptions, any>;
export declare type JsonSubTypesDecorator = JacksonDecoratorWithOptions<JsonSubTypesOptions, any>;
export declare type JsonTypeInfoDecorator = JacksonDecoratorWithOptions<JsonTypeInfoOptions, any>;
export declare type JsonIgnorePropertiesDecorator = JacksonDecoratorWithOptions<JsonIgnorePropertiesOptions, any>;
export declare type JsonGetterDecorator = JacksonDecoratorWithOptions<JsonGetterOptions, any>;
export declare type JsonSetterDecorator = JacksonDecoratorWithOptions<JsonSetterOptions, any>;
export declare type JsonTypeIdResolverDecorator = JacksonDecoratorWithOptions<JsonTypeIdResolverOptions, ClassDecorator & PropertyDecorator & ParameterDecorator>;
/**
 * Decorator type for {@link JsonAnyGetter}.
 */
export declare type JsonAnyGetterDecorator = JacksonDecoratorWithOptionalOptions<JsonAnyGetterOptions, MethodDecorator>;
/**
 * Decorator type for {@link JsonAnySetter}.
 */
export declare type JsonAnySetterDecorator = JacksonDecoratorWithOptionalOptions<JsonAnySetterOptions, MethodDecorator>;
/**
 * Decorator type for {@link JsonBackReference}.
 */
export declare type JsonBackReferenceDecorator = JacksonDecoratorWithOptionalOptions<JsonBackReferenceOptions, PropertyDecorator>;
/**
 * Decorator type for {@link JsonCreator}.
 */
export declare type JsonCreatorDecorator = JacksonDecoratorWithOptionalOptions<JsonCreatorOptions, ClassDecorator & MethodDecorator>;
export declare type JsonFormatDecorator = JacksonDecoratorWithOptionalOptions<JsonFormatOptions, any>;
export declare type JsonIgnoreDecorator = JacksonDecoratorWithOptionalOptions<JsonIgnoreOptions, any>;
export declare type JsonIgnoreTypeDecorator = JacksonDecoratorWithOptionalOptions<JsonIgnoreTypeOptions, any>;
export declare type JsonIncludeDecorator = JacksonDecoratorWithOptionalOptions<JsonIncludeOptions, any>;
export declare type JsonInjectDecorator = JacksonDecoratorWithOptionalOptions<JsonInjectOptions, any>;
export declare type JsonManagedReferenceDecorator = JacksonDecoratorWithOptionalOptions<JsonManagedReferenceOptions, any>;
export declare type JsonPropertyDecorator = JacksonDecoratorWithOptionalOptions<JsonPropertyOptions, any>;
export declare type JsonPropertyOrderDecorator = JacksonDecoratorWithOptionalOptions<JsonPropertyOrderOptions, any>;
export declare type JsonRawValueDecorator = JacksonDecoratorWithOptionalOptions<JsonRawValueOptions, any>;
export declare type JsonRootNameDecorator = JacksonDecoratorWithOptionalOptions<JsonRootNameOptions, any>;
export declare type JsonTypeNameDecorator = JacksonDecoratorWithOptionalOptions<JsonTypeNameOptions, any>;
export declare type JsonUnwrappedDecorator = JacksonDecoratorWithOptionalOptions<JsonUnwrappedOptions, any>;
export declare type JsonValueDecorator = JacksonDecoratorWithOptionalOptions<JsonValueOptions, any>;
export declare type JsonViewDecorator = JacksonDecoratorWithOptionalOptions<JsonViewOptions, any>;
export declare type JsonTypeIdDecorator = JacksonDecoratorWithOptionalOptions<JsonTypeIdOptions, any>;
export interface JsonStringifierFilterOptions {
    type: JsonFilterType;
    values?: string[];
}
export interface JsonStringifierParserCommonContext<T> {
    withViews?: (...args: any[]) => ClassType<any>[];
    features?: {
        [key: number]: boolean;
    };
    decoratorsEnabled?: {
        [key: string]: boolean;
    };
    forType?: WeakMap<ClassType<any>, T>;
}
export interface JsonStringifierContext extends JsonStringifierParserCommonContext<JsonStringifierContext> {
    attributes?: {
        [key: string]: any;
    };
    filters?: {
        [key: string]: JsonStringifierFilterOptions;
    };
    format?: string;
    serializers?: ObjectMapperSerializer[];
}
export interface JsonParserBaseWithoutMainCreatorContext extends JsonStringifierParserCommonContext<JsonParserBaseWithoutMainCreatorContext> {
    withCreatorName?: string;
    deserializers?: ObjectMapperDeserializer[];
    injectableValues?: {
        [key: string]: any;
    };
}
export interface JsonParserContext extends JsonParserBaseWithoutMainCreatorContext {
    mainCreator?: (...args: any[]) => ClassList<ClassType<any>>;
}
export declare type Serializer = (key: string, value: any, options?: JsonStringifierTransformerContext) => any;
export declare type Deserializer = (key: string, value: any, options?: JsonParserTransformerContext) => any;
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
/**
 * Basic decorator options.
 */
export interface JsonDecoratorOptions {
    /**
     * Option that defines whether this decorator is active or not.
     *
     * @default `true`
     */
    enabled?: boolean;
}
export declare type JsonDecorator = <T>(options: JsonDecoratorOptions, target: Record<string, any>, propertyKey: string | symbol, descriptorOrParamIndex: number | TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;
/**
 * Decorator options for {@link JsonAnyGetter}.
 */
export interface JsonAnyGetterOptions extends JsonDecoratorOptions {
    /**
     * Specify the name of the class property that contains the set of key/value pairs
     * that should be added along with regular property values tha class has.
     */
    for?: string;
}
/**
 * Decorator options for {@link JsonAnySetter}.
 */
export declare type JsonAnySetterOptions = JsonDecoratorOptions;
/**
 * Decorator options for {@link JsonBackReference}.
 */
export interface JsonBackReferenceOptions extends JsonDecoratorOptions {
    /**
     * Logical name for the reference property pair; used to link managed and back references.
     * Default name can be used if there is just single reference pair
     * (for example, node class that just has parent/child linkage, consisting of one managed reference and matching back reference).
     *
     * @default `'defaultReference'`
     */
    value?: string;
}
/**
 * Decorator options for {@link JsonCreator}.
 */
export interface JsonCreatorOptions extends JsonDecoratorOptions {
    /**
     * Creator name.
     */
    name?: string;
    /**
     * Property that is used to indicate how argument(s) is/are bound for creator.
     *
     * @default `JsonCreatorMode.PROPERTIES`
     */
    mode?: JsonCreatorMode;
}
export interface JsonDeserializeOptions extends JsonDecoratorOptions {
    using: (...args: any[]) => any;
}
export interface JsonFormatBaseOptions extends JsonDecoratorOptions {
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
export declare type JsonIgnoreOptions = JsonDecoratorOptions;
export interface JsonIgnorePropertiesOptions extends JsonDecoratorOptions {
    value: string[];
    allowGetters?: boolean;
    allowSetters?: boolean;
    ignoreUnknown?: boolean;
}
export declare type JsonIgnoreTypeOptions = JsonDecoratorOptions;
export interface JsonIncludeOptions extends JsonDecoratorOptions {
    value?: JsonIncludeType;
}
export interface JsonManagedReferenceOptions extends JsonDecoratorOptions {
    value?: string;
}
export interface JsonPropertyOptions extends JsonDecoratorOptions {
    value?: any;
    access?: JsonPropertyAccess;
    required?: boolean;
}
export interface JsonPropertyOrderOptions extends JsonDecoratorOptions {
    alphabetic?: boolean;
    value?: string[];
}
export declare type JsonRawValueOptions = JsonDecoratorOptions;
export interface JsonRootNameOptions extends JsonDecoratorOptions {
    value?: string;
}
export interface JsonSerializeOptions extends JsonDecoratorOptions {
    using: (...args: any[]) => any;
}
export interface JsonSubTypeOptions extends JsonDecoratorOptions {
    class: () => ClassType<any>;
    name?: string;
}
export interface JsonSubTypesOptions extends JsonDecoratorOptions {
    types: JsonSubTypeOptions[];
}
export interface JsonTypeInfoOptions extends JsonDecoratorOptions {
    use: JsonTypeInfoId;
    include: JsonTypeInfoAs;
    property?: string;
}
export interface JsonTypeNameOptions extends JsonDecoratorOptions {
    value?: string;
}
export declare type JsonValueOptions = JsonDecoratorOptions;
export interface JsonViewOptions extends JsonDecoratorOptions {
    value?: (...args: any[]) => ClassType<any>[];
}
/**
 * Decorator options for {@link JsonAlias}.
 */
export interface JsonAliasOptions extends JsonDecoratorOptions {
    /**
     * One or more secondary names to accept as aliases to the official name.
     */
    values: string[];
}
export declare type ClassTypeWithDecoratorDefinitions = () => ({
    target: ClassType<any>;
    decorators: {
        name: string;
        options: JsonDecoratorOptions;
    }[];
});
/**
 * Decorator options for {@link JsonClass}.
 */
export interface JsonClassOptions extends JsonDecoratorOptions {
    /**
     * Function used to get the type of a class property or method parameter.
     */
    class: () => ClassList<ClassType<any> | ClassTypeWithDecoratorDefinitions>;
}
export interface JsonUnwrappedOptions extends JsonDecoratorOptions {
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
export interface JsonIdentityInfoOptions extends JsonDecoratorOptions {
    generator: ObjectIdGenerator | ((obj: any) => any);
    property?: string;
    scope?: string;
    uuidv5?: UUIDv5GeneratorOptions;
    uuidv4?: UUIDv4GeneratorOptions;
    uuidv3?: UUIDv3GeneratorOptions;
    uuidv1?: UUIDv1GeneratorOptions;
}
export interface JsonIdentityReferenceOptions extends JsonDecoratorOptions {
    alwaysAsId: boolean;
}
export interface JsonStringifierTransformerContext extends JsonStringifierContext {
    mainCreator: ClassList<ClassType<any>>;
}
export declare type JsonParserTransformerContext = Modify<JsonParserContext, {
    mainCreator: ClassList<ClassType<any>>;
}>;
export interface JsonInjectOptions extends JsonDecoratorOptions {
    value?: string;
    useInput?: boolean;
}
export interface JsonFilterOptions extends JsonDecoratorOptions {
    name: string;
}
/**
 * Definition of a single attribute-backed property.
 * Attribute-backed properties will be appended after (or prepended before, as per JsonAppend.prepend())
 * regular properties in specified order, although their placement may be further changed by the usual
 * property-ordering (see {@link JsonPropertyOrder}) functionality (alphabetic sorting; explicit ordering).
 */
export interface JsonAppendOptionsAttribute {
    /**
     * Name of attribute of which value to serialize.
     */
    value: string;
    /**
     * Name to use for serializing value of the attribute; if not defined, {@link value} will be used instead.
     */
    propName?: string;
    /**
     * Property that indicates whether a value (which may be explicit null) is expected for property during serialization or not.
     */
    required?: boolean;
    /**
     * When to include attribute-property.
     */
    include?: JsonIncludeType;
}
/**
 * Decorator options for {@link JsonAppend}.
 */
export interface JsonAppendOptions extends JsonDecoratorOptions {
    /**
     * Indicator used to determine whether properties defined are
     * to be appended after (`false`) or prepended before (`true`) regular properties.
     *
     * @default `false`
     */
    prepend?: boolean;
    /**
     * Set of attribute-backed properties to include when serializing.
     *
     * @default `[]`
     */
    attrs?: JsonAppendOptionsAttribute[];
}
export interface JsonNamingOptions extends JsonDecoratorOptions {
    strategy: JsonNamingStrategy;
}
export interface JsonGetterOptions extends JsonDecoratorOptions {
    value: string;
}
export interface JsonSetterOptions extends JsonDecoratorOptions {
    value: string;
}
export declare type JsonTypeIdOptions = JsonDecoratorOptions;
export interface TypeIdResolver {
    idFromValue: (obj: any, options?: JsonStringifierTransformerContext | JsonParserTransformerContext) => string;
    typeFromId: (id: string, options?: JsonStringifierTransformerContext | JsonParserTransformerContext) => ClassType<any>;
}
export interface JsonTypeIdResolverOptions extends JsonDecoratorOptions {
    resolver: TypeIdResolver;
}
