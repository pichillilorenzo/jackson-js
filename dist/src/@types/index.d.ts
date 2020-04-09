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
import { PropertyNamingStrategy } from '../decorators/JsonNaming';
import { JsonCreatorMode } from '../decorators/JsonCreator';
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
/**
 * Decorator type for {@link JsonDeserialize}.
 */
export declare type JsonDeserializeDecorator = JacksonDecoratorWithOptions<JsonDeserializeOptions, ClassDecorator & PropertyDecorator & ParameterDecorator>;
/**
 * Decorator type for {@link JsonFilter}.
 */
export declare type JsonFilterDecorator = JacksonDecoratorWithOptions<JsonFilterOptions, ClassDecorator & PropertyDecorator>;
/**
 * Decorator type for {@link JsonIdentityInfo}.
 */
export declare type JsonIdentityInfoDecorator = JacksonDecoratorWithOptions<JsonIdentityInfoOptions, ClassDecorator & PropertyDecorator & ParameterDecorator>;
/**
 * Decorator type for {@link JsonIdentityReference}.
 */
export declare type JsonIdentityReferenceDecorator = JacksonDecoratorWithOptions<JsonIdentityReferenceOptions, ClassDecorator & PropertyDecorator>;
/**
 * Decorator type for {@link JsonNaming}.
 */
export declare type JsonNamingDecorator = JacksonDecoratorWithOptions<JsonNamingOptions, ClassDecorator>;
export declare type JsonSerializeDecorator = JacksonDecoratorWithOptions<JsonSerializeOptions, any>;
export declare type JsonSubTypesDecorator = JacksonDecoratorWithOptions<JsonSubTypesOptions, any>;
export declare type JsonTypeInfoDecorator = JacksonDecoratorWithOptions<JsonTypeInfoOptions, any>;
/**
 * Decorator type for {@link JsonIgnoreProperties}.
 */
export declare type JsonIgnorePropertiesDecorator = JacksonDecoratorWithOptions<JsonIgnorePropertiesOptions, ClassDecorator & PropertyDecorator & ParameterDecorator>;
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
/**
 * Decorator type for {@link JsonFormat}.
 */
export declare type JsonFormatDecorator = JacksonDecoratorWithOptionalOptions<JsonFormatOptions, ClassDecorator & PropertyDecorator>;
/**
 * Decorator type for {@link JsonGetter}.
 */
export declare type JsonGetterDecorator = JacksonDecoratorWithOptionalOptions<JsonGetterOptions, MethodDecorator & PropertyDecorator>;
/**
 * Decorator type for {@link JsonSetter}.
 */
export declare type JsonSetterDecorator = JacksonDecoratorWithOptionalOptions<JsonSetterOptions, MethodDecorator & PropertyDecorator>;
/**
 * Decorator type for {@link JsonIgnore}.
 */
export declare type JsonIgnoreDecorator = JacksonDecoratorWithOptionalOptions<JsonIgnoreOptions, PropertyDecorator & ParameterDecorator>;
/**
 * Decorator type for {@link JsonIgnoreType}.
 */
export declare type JsonIgnoreTypeDecorator = JacksonDecoratorWithOptionalOptions<JsonIgnoreTypeOptions, ClassDecorator>;
/**
 * Decorator type for {@link JsonInclude}.
 */
export declare type JsonIncludeDecorator = JacksonDecoratorWithOptionalOptions<JsonIncludeOptions, ClassDecorator & PropertyDecorator>;
/**
 * Decorator type for {@link JsonInject}.
 */
export declare type JsonInjectDecorator = JacksonDecoratorWithOptionalOptions<JsonInjectOptions, PropertyDecorator & ParameterDecorator>;
/**
 * Decorator type for {@link JsonManagedReference}.
 */
export declare type JsonManagedReferenceDecorator = JacksonDecoratorWithOptionalOptions<JsonManagedReferenceOptions, PropertyDecorator>;
/**
 * Decorator type for {@link JsonProperty}.
 */
export declare type JsonPropertyDecorator = JacksonDecoratorWithOptionalOptions<JsonPropertyOptions, PropertyDecorator & MethodDecorator & ParameterDecorator>;
export declare type JsonPropertyOrderDecorator = JacksonDecoratorWithOptionalOptions<JsonPropertyOrderOptions, any>;
export declare type JsonRawValueDecorator = JacksonDecoratorWithOptionalOptions<JsonRawValueOptions, any>;
export declare type JsonRootNameDecorator = JacksonDecoratorWithOptionalOptions<JsonRootNameOptions, any>;
export declare type JsonTypeNameDecorator = JacksonDecoratorWithOptionalOptions<JsonTypeNameOptions, any>;
export declare type JsonUnwrappedDecorator = JacksonDecoratorWithOptionalOptions<JsonUnwrappedOptions, any>;
export declare type JsonValueDecorator = JacksonDecoratorWithOptionalOptions<JsonValueOptions, any>;
export declare type JsonViewDecorator = JacksonDecoratorWithOptionalOptions<JsonViewOptions, any>;
export declare type JsonTypeIdDecorator = JacksonDecoratorWithOptionalOptions<JsonTypeIdOptions, any>;
/**
 * Common context properties used during serialization and deserialization.
 */
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
/**
 * Filter options used during serialization.
 */
export interface JsonStringifierFilterOptions {
    type: JsonFilterType;
    values?: string[];
}
/**
 * Context properties used during serialization without {@link JsonStringifierContext.mainCreator}.
 */
export interface JsonStringifierContextWithoutMainCreatorContext extends JsonStringifierParserCommonContext<JsonStringifierContextWithoutMainCreatorContext> {
    attributes?: {
        [key: string]: any;
    };
    filters?: {
        [key: string]: JsonStringifierFilterOptions;
    };
    format?: string;
    serializers?: ObjectMapperSerializer[];
}
/**
 * Context properties used by {@link JsonStringifier.stringify} during deserialization.
 */
export interface JsonStringifierContext extends JsonStringifierContextWithoutMainCreatorContext {
    mainCreator?: () => ClassList<ClassType<any>>;
}
/**
 * Context properties used by {@link JsonStringifier.transform} during deserialization.
 */
export declare type JsonStringifierTransformerContext = Modify<JsonStringifierContext, {
    mainCreator: ClassList<ClassType<any>>;
}>;
/**
 * Context properties used during deserialization without {@link JsonParserContext.mainCreator}.
 */
export interface JsonParserBaseWithoutMainCreatorContext extends JsonStringifierParserCommonContext<JsonParserBaseWithoutMainCreatorContext> {
    withCreatorName?: string;
    deserializers?: ObjectMapperDeserializer[];
    injectableValues?: {
        [key: string]: any;
    };
}
/**
 * Context properties used by {@link JsonParser.parse} during deserialization.
 */
export interface JsonParserContext extends JsonParserBaseWithoutMainCreatorContext {
    mainCreator?: () => ClassList<ClassType<any>>;
}
/**
 * Context properties used by {@link JsonParser.transform} during deserialization.
 */
export declare type JsonParserTransformerContext = Modify<JsonParserContext, {
    mainCreator: ClassList<ClassType<any>>;
}>;
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
     * @default {@link JsonCreatorMode.PROPERTIES}
     */
    mode?: JsonCreatorMode;
}
/**
 * Decorator options for {@link JsonDeserialize}.
 */
export interface JsonDeserializeOptions extends JsonDecoratorOptions {
    /**
     * Deserializer function to use for deserializing associated value.
     * @param args
     */
    using: (...args: any[]) => any;
}
/**
 * Decorator base options for {@link JsonFormat}.
 */
export interface JsonFormatBaseOptions extends JsonDecoratorOptions {
    /**
     * Shape to be used by {@link JsonFormat}.
     */
    shape?: JsonFormatShape;
}
/**
 * Decorator specific options for {@link JsonFormat} with {@link JsonFormatBaseOptions.shape} value {@link JsonFormatShape.ANY}.
 */
export interface JsonFormatAny extends JsonFormatBaseOptions {
    shape: JsonFormatShape.ANY;
}
/**
 * Decorator specific options for {@link JsonFormat} with {@link JsonFormatBaseOptions.shape} value {@link JsonFormatShape.ARRAY}.
 */
export interface JsonFormatArray extends JsonFormatBaseOptions {
    shape: JsonFormatShape.ARRAY;
}
/**
 * Decorator specific options for {@link JsonFormat} with {@link JsonFormatBaseOptions.shape} value {@link JsonFormatShape.BOOLEAN}.
 */
export interface JsonFormatBoolean extends JsonFormatBaseOptions {
    shape: JsonFormatShape.BOOLEAN;
}
/**
 * Decorator specific options for {@link JsonFormat} with {@link JsonFormatBaseOptions.shape} value {@link JsonFormatShape.NUMBER_FLOAT}.
 */
export interface JsonFormatNumberFloat extends JsonFormatBaseOptions {
    shape: JsonFormatShape.NUMBER_FLOAT;
}
/**
 * Decorator specific options for {@link JsonFormat} with {@link JsonFormatBaseOptions.shape} value {@link JsonFormatShape.NUMBER_INT}.
 */
export interface JsonFormatNumberInt extends JsonFormatBaseOptions {
    shape: JsonFormatShape.NUMBER_INT;
}
/**
 * Decorator specific options for {@link JsonFormat} with {@link JsonFormatBaseOptions.shape} value {@link JsonFormatShape.OBJECT}.
 */
export interface JsonFormatObject extends JsonFormatBaseOptions {
    shape: JsonFormatShape.OBJECT;
}
/**
 * Decorator specific options for {@link JsonFormat} with {@link JsonFormatBaseOptions.shape} value {@link JsonFormatShape.SCALAR}.
 */
export interface JsonFormatScalar extends JsonFormatBaseOptions {
    shape: JsonFormatShape.SCALAR;
}
/**
 * Decorator specific options for {@link JsonFormat} with {@link JsonFormatBaseOptions.shape} value {@link JsonFormatShape.STRING}.
 *
 * When formatting a `Date`, the {@link https://github.com/iamkun/dayjs} date library is used.
 */
export interface JsonFormatString extends JsonFormatBaseOptions {
    shape: JsonFormatShape.STRING;
    /**
     * Pattern to be used to format a `Date` during serialization.
     */
    pattern?: string;
    /**
     * Locale to be used to format a `Date` during serialization.
     *
     * @default `'en'`
     */
    locale?: string;
    /**
     * Timezone to be used to format a `Date` during serialization.
     */
    timezone?: string;
    /**
     * Radix to be used to format an integer `Number` during serialization and using `parseInt()`.
     */
    radix?: number;
    /**
     * An integer specifying the number of digits after the decimal point
     * to be used to format an integer `Number` during serialization and using `toExponential()`.
     */
    toExponential?: number;
    /**
     * The number of digits to appear after the decimal point to be used to format a `Number`
     * during serialization and using `toFixed()`.
     */
    toFixed?: number;
    /**
     * An integer specifying the number of significant digits to be used to format a `Number`
     * during serialization and using `toPrecision()`.
     */
    toPrecision?: number;
}
/**
 * Decorator options for {@link JsonFormat}.
 *
 * @default {@link JsonFormatAny}
 */
export declare type JsonFormatOptions = JsonFormatAny | JsonFormatArray | JsonFormatBoolean | JsonFormatNumberFloat | JsonFormatNumberInt | JsonFormatObject | JsonFormatScalar | JsonFormatString;
/**
 * Decorator options for {@link JsonIgnore}.
 */
export declare type JsonIgnoreOptions = JsonDecoratorOptions;
/**
 * Decorator options for {@link JsonIgnoreProperties}.
 */
export interface JsonIgnorePropertiesOptions extends JsonDecoratorOptions {
    /**
     * Names of properties to ignore.
     */
    value: string[];
    /**
     * Property that can be enabled to allow "getters" to be used
     * (that is, prevent ignoral of getters for properties listed in {@link value}).
     *
     * @default `false`
     */
    allowGetters?: boolean;
    /**
     * Property that can be enabled to allow "setters" to be used
     * (that is, prevent ignoral of setters for properties listed in {@link value}).
     *
     * @default `false`
     */
    allowSetters?: boolean;
    /**
     * Property that defines whether it is ok to just ignore
     * any unrecognized properties during deserialization.
     *
     * @default `false`
     */
    ignoreUnknown?: boolean;
}
/**
 * Decorator options for {@link JsonIgnoreType}.
 */
export declare type JsonIgnoreTypeOptions = JsonDecoratorOptions;
/**
 * Decorator options for {@link JsonInclude}.
 */
export interface JsonIncludeOptions extends JsonDecoratorOptions {
    /**
     * Inclusion rule to use for instances (values) of types (Classes) or properties decorated.
     *
     * @default {@link JsonIncludeType.ALWAYS}
     */
    value?: JsonIncludeType;
    /**
     * Specifies a function to use in case {@link value} is {@link JsonIncludeType.CUSTOM} for filtering the value.
     * If it returns `true`, then the value is not serialized.
     *
     * @param value - value to be filtered.
     * @returns boolean
     */
    valueFilter?: (value: any) => boolean;
    /**
     * Inclusion rule to use for entries ("content") of decorated `Map` or "Object Literal" properties.
     *
     * @default {@link JsonIncludeType.ALWAYS}
     */
    content?: JsonIncludeType;
    /**
     * Specifies a function to use in case {@link content} is {@link JsonIncludeType.CUSTOM} for filtering the content value.
     * If it returns `true`, then the content value is not serialized.
     *
     * @param value - content value to be filtered.
     * @returns boolean
     */
    contentFilter?: (value: any) => boolean;
}
/**
 * Decorator options for {@link JsonManagedReference}.
 */
export interface JsonManagedReferenceOptions extends JsonDecoratorOptions {
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
 * Decorator options for {@link JsonProperty}.
 */
export interface JsonPropertyOptions extends JsonDecoratorOptions {
    /**
     * Defines name of the logical property.
     */
    value?: any;
    /**
     * Property that may be used to change the way visibility of accessors (getter, field-as-getter)
     * and mutators (constructor parameter, setter, field-as-setter) is determined.
     *
     * @default {@link JsonPropertyAccess.READ_WRITE}
     */
    access?: JsonPropertyAccess;
    /**
     * Property that indicates whether a value (which may be explicit null)
     * is expected for property during deserialization or not.
     *
     * @default `false`
     */
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
/**
 * Options for version 5 UUID Generator (see {@link https://github.com/uuidjs/uuid#version-5-namespace})
 */
export interface UUIDv5GeneratorOptions {
    name?: string | Array<any>;
    namespace?: string | FixedLengthArray<number, 16>;
    buffer?: Array<any> | Buffer;
    offset?: number;
}
/**
 * Options for version 4 UUID Generator (see {@link https://github.com/uuidjs/uuid#version-4-random})
 */
export interface UUIDv4GeneratorOptions {
    options?: {
        random?: FixedLengthArray<number, 16>;
        rng?: () => FixedLengthArray<number, 16>;
    };
    buffer?: Array<any> | Buffer;
    offset?: number;
}
/**
 * Options for version 3 UUID Generator (see {@link https://github.com/uuidjs/uuid#version-3-namespace})
 */
export interface UUIDv3GeneratorOptions {
    name?: string | Array<any>;
    namespace?: string | FixedLengthArray<number, 16>;
    buffer?: Array<any> | Buffer;
    offset?: number;
}
/**
 * Options for version 1 UUID Generator (see {@link https://github.com/uuidjs/uuid#version-1-timestamp})
 */
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
/**
 * Decorator options for {@link JsonIdentityInfo}.
 */
export interface JsonIdentityInfoOptions extends JsonDecoratorOptions {
    /**
     * Generator to use for producing Object Identifier for objects:
     * either one of pre-defined generators from {@link ObjectIdGenerator}, or a custom generator.
     */
    generator: ObjectIdGenerator | ((obj: any) => any);
    /**
     * Name of JSON property in which Object Id will reside.
     *
     * @default `'@id'`
     */
    property?: string;
    /**
     * Scope is used to define applicability of an Object Id: all ids must be unique within their scope;
     * where scope is defined as combination of this value and generator type.
     */
    scope?: string;
    /**
     * Options for version 5 UUID Generator (see {@link https://github.com/uuidjs/uuid#version-5-namespace})
     */
    uuidv5?: UUIDv5GeneratorOptions;
    /**
     * Options for version 4 UUID Generator (see {@link https://github.com/uuidjs/uuid#version-4-random})
     */
    uuidv4?: UUIDv4GeneratorOptions;
    /**
     * Options for version 3 UUID Generator (see {@link https://github.com/uuidjs/uuid#version-3-namespace})
     */
    uuidv3?: UUIDv3GeneratorOptions;
    /**
     * Options for version 1 UUID Generator (see {@link https://github.com/uuidjs/uuid#version-1-timestamp})
     */
    uuidv1?: UUIDv1GeneratorOptions;
}
/**
 * Decorator options for {@link JsonIdentityReference}.
 */
export interface JsonIdentityReferenceOptions extends JsonDecoratorOptions {
    /**
     * Marker to indicate whether all referenced values are to be serialized as ids (true);
     * or by serializing the first encountered reference as Class and only then as id (false).
     */
    alwaysAsId: boolean;
}
/**
 * Decorator options for {@link JsonInject}.
 */
export interface JsonInjectOptions extends JsonDecoratorOptions {
    /**
     * Logical id of the value to inject; if not specified (or specified as empty String),
     * will use id based on declared type of property.
     */
    value?: string;
    /**
     * Whether matching value from input (if any) is used for decorated property or not; if disabled (`false`),
     * input value (if any) will be ignored; otherwise it will override injected value.
     *
     * @default `true`
     */
    useInput?: boolean;
}
/**
 * Decorator options for {@link JsonFilter}.
 */
export interface JsonFilterOptions extends JsonDecoratorOptions {
    /**
     * Id of filter to use.
     */
    value: string;
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
/**
 * Decorator options for {@link JsonNaming}.
 */
export interface JsonNamingOptions extends JsonDecoratorOptions {
    /**
     * Strategies that defines how names of JSON properties ("external names")
     * are derived from names of POJO methods and fields ("internal names").
     */
    strategy: PropertyNamingStrategy;
}
/**
 * Decorator options for {@link JsonGetter}.
 */
export interface JsonGetterOptions extends JsonDecoratorOptions {
    /**
     * Defines name of the logical property this method is used to access.
     */
    value?: string;
}
export interface JsonSetterOptions extends JsonDecoratorOptions {
    value?: string;
}
export declare type JsonTypeIdOptions = JsonDecoratorOptions;
export interface TypeIdResolver {
    idFromValue: (obj: any, options?: JsonStringifierTransformerContext | JsonParserTransformerContext) => string;
    typeFromId: (id: string, options?: JsonStringifierTransformerContext | JsonParserTransformerContext) => ClassType<any>;
}
export interface JsonTypeIdResolverOptions extends JsonDecoratorOptions {
    resolver: TypeIdResolver;
}
