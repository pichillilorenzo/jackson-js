import {JsonTypeInfoAs, JsonTypeInfoId} from "../annotations/JsonTypeInfo";
import {JsonIncludeType} from "../annotations/JsonInclude";
import {JsonFormatShape} from "../annotations/JsonFormat";
import {JsonPropertyAccess} from "../annotations/JsonProperty";

declare type ClassType<T> = {new (): T;} | {new (...args: any[]): T;} | {(...args: any[]): T;} | {(...args: any[]): (cls: any) => T;};

declare interface JsonStringifierOptions {
  withView?: ClassType<any>,
  format?: string,
  features?: {
    [key: number]: boolean
  },
  serializers?: ObjectMapperSerializer[]
}

declare interface JsonParserOptions<T> {
  mainCreator?: ClassType<T>,
  withView?: ClassType<any>,
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
}

declare type JsonAnnotationDecorator = <T>(options: JsonAnnotationOptions, target: Object, propertyKey: string | symbol, descriptorOrParamIndex: number | TypedPropertyDescriptor<T>) => TypedPropertyDescriptor<T> | void;

declare interface JsonAnyGetterOptions extends JsonAnnotationOptions {
  enabled?: boolean
}

declare interface JsonAnySetterOptions extends JsonAnnotationOptions {
  enabled?: boolean
}

declare interface JsonBackReferenceOptions extends JsonAnnotationOptions {
  class?: (...args) => ClassType<any>,
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
  value?: boolean
}

declare interface JsonIgnorePropertiesOptions extends JsonAnnotationOptions {
  value?: string[],
  allowGetters?: boolean,
  allowSetters?: boolean,
  ignoreUnknown?: boolean
}

declare interface JsonIgnoreTypeOptions extends JsonAnnotationOptions {
  value?: boolean
}

declare interface JsonIncludeOptions extends JsonAnnotationOptions {
  value?: JsonIncludeType
}

declare interface JsonManagedReferenceOptions extends JsonAnnotationOptions {
  class?: (...args) => ClassType<any>,
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
  value?: boolean
}

declare interface JsonRootNameOptions extends JsonAnnotationOptions {
  value?: string
}

declare interface JsonSerializeOptions extends JsonAnnotationOptions {
  using?: (...args) => any,
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
  enabled?: boolean
}

declare interface JsonViewOptions extends JsonAnnotationOptions {
  value?: ((...args) => ClassType<any>)[]
}

declare interface JsonAliasOptions extends JsonAnnotationOptions {
  values: string[]
}

declare interface JsonClassOptions extends JsonAnnotationOptions {
  class: (...args) => ClassType<any>
}

declare interface JsonUnwrappedOptions extends JsonAnnotationOptions {
  enabled?: boolean,
  prefix?: string,
  suffix?: string
}

declare interface JsonIdentityInfoOptions extends JsonAnnotationOptions {
  property?: string
}
