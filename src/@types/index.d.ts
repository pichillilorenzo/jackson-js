import {JsonTypeInfoAs, JsonTypeInfoId} from "../annotations/JsonTypeInfo";
import {JsonIncludeType} from "../annotations/JsonInclude";
import {JsonFormatShape} from "../annotations/JsonFormat";
import {JsonPropertyAccess} from "../annotations/JsonProperty";
import {ObjectIdGenerator} from "../annotations/JsonIdentityInfo";

declare type ClassType<T> = {new (): T;} | {new (...args: any[]): T;};

type ArrayLengthMutationKeys = 'splice' | 'push' | 'pop' | 'shift' |  'unshift'
type FixedLengthArray<T, L extends number, TObj = [T, ...Array<T>]> =
  Pick<TObj, Exclude<keyof TObj, ArrayLengthMutationKeys>>
  & {
  readonly length: L
  [ I : number ] : T
  [Symbol.iterator]: () => IterableIterator<T>
}

interface ClassList<T> extends Array<any> {
  0: T;
  [index: number]: T | ClassList<T>;
}

declare interface JsonStringifierOptions {
  withView?: (...args) => ClassType<any>,
  format?: string,
  features?: {
    [key: number]: boolean
  },
  serializers?: ObjectMapperSerializer[]
}

declare interface JsonParserOptions {
  mainCreator?: (...args) => ClassList<ClassType<any>>,
  withView?: (...args) => ClassType<any>,
  features?: {
    [key: number]: boolean
  },
  deserializers?: ObjectMapperDeserializer[]
}

declare type Serializer = (key: string, value: any) => any;

declare type Deserializer = (key: string, value: any) => any;

declare type ObjectMapperFeatures = {
  serialization: {
    [key: number]: boolean
  }
  deserialization: {
    [key: number]: boolean
  }
};

declare interface ObjectMapperCustomMapper<T> {
  mapper: T,
  type?: ClassType<any> | "string" | "number" | "object",
  order?: number
}

declare interface ObjectMapperSerializer extends ObjectMapperCustomMapper<Serializer> {

}

declare interface ObjectMapperDeserializer extends ObjectMapperCustomMapper<Deserializer> {

}

declare interface JsonAnnotationOptions {
  enabled?: boolean
}

declare type JsonAnnotationDecorator = <T>(options: JsonAnnotationOptions, target: Object, propertyKey: string | symbol, descriptorOrParamIndex: number | TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;

declare interface JsonAnyGetterOptions extends JsonAnnotationOptions {

}

declare interface JsonAnySetterOptions extends JsonAnnotationOptions {

}

declare interface JsonBackReferenceOptions extends JsonAnnotationOptions {
  value?: string
}

declare interface JsonCreatorOptions extends JsonAnnotationOptions {
  properties?: {}
}

declare interface JsonDeserializeOptions extends JsonAnnotationOptions {
  using?: (...args) => any,
}

declare interface JsonFormatOptions extends JsonAnnotationOptions {
  shape?: JsonFormatShape,
  pattern?: string,
  locale?: string,
  timezone?: string | Intl.DateTimeFormatOptions
}

declare interface JsonIgnoreOptions extends JsonAnnotationOptions {

}

declare interface JsonIgnorePropertiesOptions extends JsonAnnotationOptions {
  value?: string[],
  allowGetters?: boolean,
  allowSetters?: boolean,
  ignoreUnknown?: boolean
}

declare interface JsonIgnoreTypeOptions extends JsonAnnotationOptions {

}

declare interface JsonIncludeOptions extends JsonAnnotationOptions {
  value?: JsonIncludeType
}

declare interface JsonManagedReferenceOptions extends JsonAnnotationOptions {
  value?: string
}

declare interface JsonPropertyOptions extends JsonAnnotationOptions {
  class?: (...args) => ClassType<any>,
  value?: any,
  defaultValue?: any,
  access?: JsonPropertyAccess,
  required?: boolean
}

declare interface JsonPropertyOrderOptions extends JsonAnnotationOptions {
  alphabetic?: boolean,
  value?: string[]
}

declare interface JsonRawValueOptions extends JsonAnnotationOptions {

}

declare interface JsonRootNameOptions extends JsonAnnotationOptions {
  value?: string
}

declare interface JsonSerializeOptions extends JsonAnnotationOptions {
  using: (...args) => any,
}

declare interface JsonSubTypeOptions extends JsonAnnotationOptions {
  class: (...args) => ClassType<any>,
  name?: string
}

declare interface JsonSubTypesOptions extends JsonAnnotationOptions {
  types: JsonSubTypeOptions[]
}

declare interface JsonTypeInfoOptions extends JsonAnnotationOptions {
  use: JsonTypeInfoId,
  include: JsonTypeInfoAs,
  property?: string
}

declare interface JsonTypeNameOptions extends JsonAnnotationOptions {
  value?: string
}

declare interface JsonValueOptions extends JsonAnnotationOptions {

}

declare interface JsonViewOptions extends JsonAnnotationOptions {
  value?: ((...args) => ClassType<any>)[]
}

declare interface JsonAliasOptions extends JsonAnnotationOptions {
  values: string[]
}

declare interface JsonClassOptions extends JsonAnnotationOptions {
  class: (...args) => ClassList<ClassType<any>>
}

declare interface JsonUnwrappedOptions extends JsonAnnotationOptions {
  prefix?: string,
  suffix?: string
}

declare interface UUIDv5GeneratorOptions {
  name?: string | Array<any>,
  namespace?: string | FixedLengthArray<number, 16>,
  buffer?: Array<any> | Buffer,
  offset?: number
}

declare interface UUIDv4GeneratorOptions {
  options?: {
    random?: FixedLengthArray<number, 16>,
    rng?: () => FixedLengthArray<number, 16>,
  },
  buffer?: Array<any> | Buffer,
  offset?: number
}

declare interface UUIDv3GeneratorOptions {
  name?: string | Array<any>,
  namespace?: string | FixedLengthArray<number, 16>,
  buffer?: Array<any> | Buffer,
  offset?: number
}

declare interface UUIDv1GeneratorOptions {
  options?: {
    node?: FixedLengthArray<number, 6>,
    clockseq?: number,
    msecs?: number,
    nsecs?: number
    random?: FixedLengthArray<number, 16>,
    rng?: () => FixedLengthArray<number, 16>,
  },
  buffer?: Array<any> | Buffer,
  offset?: number
}

declare interface JsonIdentityInfoOptions extends JsonAnnotationOptions {
  generator: ObjectIdGenerator | ((obj: any) => any),
  property?: string,
  scope?: string,
  uuidv5?: UUIDv5GeneratorOptions,
  uuidv4?: UUIDv4GeneratorOptions,
  uuidv3?: UUIDv3GeneratorOptions,
  uuidv1?: UUIDv1GeneratorOptions,
}
