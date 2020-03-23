import {JsonTypeInfoAs, JsonTypeInfoId} from '../annotations/JsonTypeInfo';
import {JsonIncludeType} from '../annotations/JsonInclude';
import {JsonFormatShape} from '../annotations/JsonFormat';
import {JsonPropertyAccess} from '../annotations/JsonProperty';
import {ObjectIdGenerator} from '../annotations/JsonIdentityInfo';
import {JsonFilterType} from '../annotations/JsonFilter';
import {JsonNamingStrategy} from '../annotations/JsonNaming';

/**
 * https://stackoverflow.com/a/55032655/4637638
 */
export type Modify<T, R> = Omit<T, keyof R> & R;
// before typescript@3.5
// type Modify<T, R> = Pick<T, Exclude<keyof T, keyof R>> & R;

export type ClassType<T> = (new () => T) | (new (...args: any[]) => T) |
((...args: any[]) => T) | ((...args: any[]) => ((cls: any) => T));

export type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' |  'unshift';
export type FixedLengthArray<T, L extends number, TObj = [T, ...Array<T>]> =
Pick<TObj, Exclude<keyof TObj, ArrayLengthMutationKeys>>
& {
  [ I: number ]: T;
  readonly length: L;
  [Symbol.iterator]: () => IterableIterator<T>;
};

export interface ClassList<T> extends Array<any> {
  [index: number]: T | ClassList<T>;
  0: T;
}

export type JacksonDecoratorWithOptions<T extends JsonAnnotationOptions> = (options: T) => any;
export type JacksonDecoratorWithOptionalOptions<T extends JsonAnnotationOptions> = (options?: T) => any;
export type JacksonDecorator<T extends JsonAnnotationOptions> = JacksonDecoratorWithOptions<T> | JacksonDecoratorWithOptionalOptions<T>;

// with options
export type JsonAliasDecorator = JacksonDecoratorWithOptions<JsonAliasOptions>;
export type JsonAppendDecorator = JacksonDecoratorWithOptions<JsonAppendOptions>;
export type JsonClassDecorator = JacksonDecoratorWithOptions<JsonClassOptions>;
export type JsonDeserializeDecorator = JacksonDecoratorWithOptions<JsonDeserializeOptions>;
export type JsonFilterDecorator = JacksonDecoratorWithOptions<JsonFilterOptions>;
export type JsonIdentityInfoDecorator = JacksonDecoratorWithOptions<JsonIdentityInfoOptions>;
export type JsonIdentityReferenceDecorator = JacksonDecoratorWithOptions<JsonIdentityReferenceOptions>;
export type JsonNamingDecorator = JacksonDecoratorWithOptions<JsonNamingOptions>;
export type JsonSerializeDecorator = JacksonDecoratorWithOptions<JsonSerializeOptions>;
export type JsonSubTypesDecorator = JacksonDecoratorWithOptions<JsonSubTypesOptions>;
export type JsonTypeInfoDecorator = JacksonDecoratorWithOptions<JsonTypeInfoOptions>;

// with optional options
export type JsonAnyGetterDecorator = JacksonDecoratorWithOptionalOptions<JsonAnyGetterOptions>;
export type JsonAnySetterDecorator = JacksonDecoratorWithOptionalOptions<JsonAnySetterOptions>;
export type JsonBackReferenceDecorator = JacksonDecoratorWithOptionalOptions<JsonBackReferenceOptions>;
export type JsonCreatorDecorator = JacksonDecoratorWithOptionalOptions<JsonCreatorOptions>;
export type JsonFormatDecorator = JacksonDecoratorWithOptionalOptions<JsonFormatOptions>;
export type JsonIgnoreDecorator = JacksonDecoratorWithOptionalOptions<JsonIgnoreOptions>;
export type JsonIgnorePropertiesDecorator = JacksonDecoratorWithOptionalOptions<JsonIgnorePropertiesOptions>;
export type JsonIgnoreTypeDecorator = JacksonDecoratorWithOptionalOptions<JsonIgnoreTypeOptions>;
export type JsonIncludeDecorator = JacksonDecoratorWithOptionalOptions<JsonIncludeOptions>;
export type JsonInjectDecorator = JacksonDecoratorWithOptionalOptions<JsonInjectOptions>;
export type JsonManagedReferenceDecorator = JacksonDecoratorWithOptionalOptions<JsonManagedReferenceOptions>;
export type JsonPropertyDecorator = JacksonDecoratorWithOptionalOptions<JsonPropertyOptions>;
export type JsonPropertyOrderDecorator = JacksonDecoratorWithOptionalOptions<JsonPropertyOrderOptions>;
export type JsonRawValueDecorator = JacksonDecoratorWithOptionalOptions<JsonRawValueOptions>;
export type JsonRootNameDecorator = JacksonDecoratorWithOptionalOptions<JsonRootNameOptions>;
export type JsonTypeNameDecorator = JacksonDecoratorWithOptionalOptions<JsonTypeNameOptions>;
export type JsonUnwrappedDecorator = JacksonDecoratorWithOptionalOptions<JsonUnwrappedOptions>;
export type JsonValueDecorator = JacksonDecoratorWithOptionalOptions<JsonValueOptions>;
export type JsonViewDecorator = JacksonDecoratorWithOptionalOptions<JsonViewOptions>;

export interface JsonStringifierFilterOptions {
  type: JsonFilterType;
  values?: string[];
}

export interface JsonStringifierOptions {
  withViews?: (...args) => ClassType<any>[];
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
  withViews?: (...args) => ClassType<any>[];
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
  mainCreator?: (...args) => ClassList<ClassType<any>>;
}

export type Serializer = (key: string, value: any) => any;

export type Deserializer = (key: string, value: any) => any;

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
  type?: (...args) => any;
  order?: number;
}

export type ObjectMapperSerializer = ObjectMapperCustomMapper<Serializer>;

export type ObjectMapperDeserializer = ObjectMapperCustomMapper<Deserializer>;

export interface JsonAnnotationOptions {
  enabled?: boolean;
}

export type JsonAnnotationDecorator = <T>(options: JsonAnnotationOptions,
  target: Record<string, any>,
  propertyKey: string | symbol,
  descriptorOrParamIndex: number | TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;

export interface JsonAnyGetterOptions extends JsonAnnotationOptions {
  for?: string;
}

export type JsonAnySetterOptions = JsonAnnotationOptions;

export interface JsonBackReferenceOptions extends JsonAnnotationOptions {
  value?: string;
}

export interface JsonCreatorOptions extends JsonAnnotationOptions {
  name?: string;
}

export interface JsonDeserializeOptions extends JsonAnnotationOptions {
  using: (...args) => any;
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
  // for Date
  pattern?: string;
  locale?: string;
  timezone?: string;
  // for Number
  radix?: number;
  toExponential?: number;
  toFixed?: number;
  toPrecision?: number;
}

export type JsonFormatOptions = JsonFormatAny | JsonFormatArray | JsonFormatBoolean | JsonFormatNumberFloat |
JsonFormatNumberInt | JsonFormatObject | JsonFormatScalar | JsonFormatString;

export type JsonIgnoreOptions = JsonAnnotationOptions;

export interface JsonIgnorePropertiesOptions extends JsonAnnotationOptions {
  value?: string[];
  allowGetters?: boolean;
  allowSetters?: boolean;
  ignoreUnknown?: boolean;
}

export type JsonIgnoreTypeOptions = JsonAnnotationOptions;

export interface JsonIncludeOptions extends JsonAnnotationOptions {
  value?: JsonIncludeType;
}

export interface JsonManagedReferenceOptions extends JsonAnnotationOptions {
  value?: string;
}

export interface JsonPropertyOptions extends JsonAnnotationOptions {
  class?: (...args) => ClassType<any>;
  value?: any;
  defaultValue?: any;
  access?: JsonPropertyAccess;
  required?: boolean;
}

export interface JsonPropertyOrderOptions extends JsonAnnotationOptions {
  alphabetic?: boolean;
  value?: string[];
}

export type JsonRawValueOptions = JsonAnnotationOptions;

export interface JsonRootNameOptions extends JsonAnnotationOptions {
  value?: string;
}

export interface JsonSerializeOptions extends JsonAnnotationOptions {
  using: (...args) => any;
}

export interface JsonSubTypeOptions extends JsonAnnotationOptions {
  class: (...args) => ClassType<any>;
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

export type JsonValueOptions = JsonAnnotationOptions;

export interface JsonViewOptions extends JsonAnnotationOptions {
  value?: (...args) => ClassType<any>[];
}

export interface JsonAliasOptions extends JsonAnnotationOptions {
  values: string[];
}

export interface JsonClassOptions extends JsonAnnotationOptions {
  class: (...args) => ClassList<ClassType<any>>;
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

export type JsonParserTransformerOptions = Modify<JsonParserOptions, {
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
