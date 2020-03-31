import {
  JsonAnyGetterOptions,
  JsonAnySetterOptions,
  JsonBackReferenceOptions,
  JsonCreatorOptions, JsonGetterOptions,
  JsonManagedReferenceOptions, JsonSetterOptions, JsonTypeNameOptions, JsonValueOptions
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
  propertyKey: string;
}

/** @internal */
export interface JsonSetterPrivateOptions extends JsonSetterOptions {
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