import {
  JsonAnyGetterOptions,
  JsonAnySetterOptions,
  JsonBackReferenceOptions,
  JsonCreatorOptions,
  JsonManagedReferenceOptions, JsonTypeNameOptions, JsonValueOptions
} from './index';

export interface JsonAnyGetterPrivateOptions extends JsonAnyGetterOptions {
  propertyKey: string;
}

export interface JsonAnySetterPrivateOptions extends JsonAnySetterOptions {
  propertyKey: string;
}

export interface JsonBackReferencePrivateOptions extends JsonBackReferenceOptions {
  propertyKey: string;
}

export interface JsonManagedReferencePrivateOptions extends JsonManagedReferenceOptions {
  propertyKey: string;
}

export interface JsonCreatorPrivateOptions extends JsonCreatorOptions {
  ctor?: Record<string, any> | ObjectConstructor;
  method?: Function;
  propertyKey?: string;
}

export interface JsonValuePrivateOptions extends JsonValueOptions {
  propertyKey: string;
}

export interface JsonTypeNamePrivateOptions extends JsonTypeNameOptions {
  ctor?: Record<string, any> | ObjectConstructor;
}
