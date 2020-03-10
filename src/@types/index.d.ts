import {JsonTypeInfoAs, JsonTypeInfoId} from "../annotations/JsonTypeInfo";
import {JsonIncludeType} from "../annotations/JsonInclude";
import {JsonFormatShape} from "../annotations/JsonFormat";
import {JsonPropertyAccess} from "../annotations/JsonProperty";

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
  class?: (...args) => Object,
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
  timezone?: Intl.DateTimeFormatOptions
}

declare interface JsonIgnoreOptions extends JsonAnnotationOptions {
  value?: boolean
}

declare interface JsonIgnorePropertiesOptions extends JsonAnnotationOptions {
  value: string[],
  allowGetters?: boolean,
  allowSetters?: boolean
}

declare interface JsonIgnoreTypeOptions extends JsonAnnotationOptions {
  value?: boolean
}

declare interface JsonIncludeOptions extends JsonAnnotationOptions {
  value?: JsonIncludeType
}

declare interface JsonManagedReferenceOptions extends JsonAnnotationOptions {
  class?: (...args) => Object,
  value?: string
}

declare interface JsonPropertyOptions extends JsonAnnotationOptions {
  class?: (...args) => Object,
  value?: any,
  defaultValue?: any,
  access?: JsonPropertyAccess,
  required?: boolean
}

declare interface JsonPropertyOrderOptions extends JsonAnnotationOptions {
  alphabetic?: boolean,
  value: string[]
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
  class: (...args) => Object,
  name?: string
}

declare interface JsonSubTypesOptions extends JsonAnnotationOptions {
  types: JsonSubTypeOptions[]
}

declare interface JsonTypeInfoOptions extends JsonAnnotationOptions {
  use: JsonTypeInfoId,
  include: JsonTypeInfoAs,
  property: '@type'
}

declare interface JsonTypeNameOptions extends JsonAnnotationOptions {
  value?: string
}

declare interface JsonValueOptions extends JsonAnnotationOptions {
  enabled?: boolean
}

declare interface JsonViewOptions extends JsonAnnotationOptions {
  value?: (...args) => Object
}

declare interface JsonAliasOptions extends JsonAnnotationOptions {
  values: string[]
}