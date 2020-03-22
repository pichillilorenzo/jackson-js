import {
  JsonAnyGetterOptions,
  JsonAnySetterOptions,
  JsonBackReferenceOptions,
  JsonCreatorOptions,
  JsonManagedReferenceOptions
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
  constructor?: Record<string, any> | ObjectConstructor;
  method?: Function;
}
