import {
  JsonAnyGetterOptions,
  JsonAnySetterOptions,
  JsonBackReferenceOptions,
  JsonCreatorOptions,
  JsonGetterOptions,
  JsonManagedReferenceOptions,
  JsonPropertyOptions,
  JsonSetterOptions,
  JsonTypeIdOptions,
  JsonTypeNameOptions, JsonUnwrappedOptions,
  JsonValueOptions
} from './index';

/** @internal */
export interface JsonAnyGetterPrivateOptions extends JsonAnyGetterOptions {
  propertyKey: string;
}

/** @internal */
export interface JsonAnySetterPrivateOptions extends JsonAnySetterOptions {
  propertyKey: string;
}

/** @internal */
export interface JsonGetterPrivateOptions extends JsonGetterOptions {
  descriptor: TypedPropertyDescriptor<any>;
  propertyKey: string;
}

/** @internal */
export interface JsonSetterPrivateOptions extends JsonSetterOptions {
  descriptor: TypedPropertyDescriptor<any>;
  propertyKey: string;
}

/** @internal */
export interface JsonPropertyPrivateOptions extends JsonPropertyOptions {
  descriptor: TypedPropertyDescriptor<any>;
  propertyKey: string;
}

/** @internal */
export interface JsonBackReferencePrivateOptions extends JsonBackReferenceOptions {
  propertyKey: string;
}

/** @internal */
export interface JsonManagedReferencePrivateOptions extends JsonManagedReferenceOptions {
  propertyKey: string;
}

/** @internal */
export interface JsonCreatorPrivateOptions extends JsonCreatorOptions {
  ctor?: Record<string, any> | ObjectConstructor;
  method?: Function;
  propertyKey?: string;
}

/** @internal */
export interface JsonValuePrivateOptions extends JsonValueOptions {
  propertyKey: string;
}

/** @internal */
export interface JsonTypeNamePrivateOptions extends JsonTypeNameOptions {
  ctor?: Record<string, any> | ObjectConstructor;
}

/** @internal */
export interface JsonTypeIdPrivateOptions extends JsonTypeIdOptions {
  propertyKey: string;
}

/** @internal */
export interface JsonUnwrappedPrivateOptions extends JsonUnwrappedOptions {
  descriptor: TypedPropertyDescriptor<any>;
}
