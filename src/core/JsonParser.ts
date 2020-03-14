import {JsonCreatorPrivateOptions} from "../annotations/JsonCreator";
import {getArgumentNames, isExtensionOf, isSameConstructor} from "../util";
import {
  ClassType,
  JsonAliasOptions,
  JsonBackReferenceOptions,
  JsonClassOptions, JsonIdentityInfoOptions, JsonIgnorePropertiesOptions,
  JsonManagedReferenceOptions, JsonParserOptions,
  JsonPropertyOptions, JsonSubTypeOptions, JsonTypeInfoOptions, JsonUnwrappedOptions, JsonViewOptions
} from "../@types";
import {JsonPropertyAccess} from "../annotations/JsonProperty";
import {JsonTypeInfoAs, JsonTypeInfoId} from "../annotations/JsonTypeInfo";
import {DeserializationFeature} from "../databind/DeserializationFeature";

export class JsonParser<T, R> {

  // Map used to restore object circular references
  private _valueAlreadySeen = new Map();

  constructor() {
  }

  parse(text: string, options: JsonParserOptions<R> = {}): T {

    if (options.mainCreator) {
      const value = JSON.parse(text);
      return this.deepParse('', value, options)
    }
    return JSON.parse(text, (key: string, value: any) => {
      return this.invokeCustomDeserializers(key, value, options);
    });
  }

  private deepParse(key: string, value: any, options: JsonParserOptions<R>): T {

    value = this.invokeCustomDeserializers(key, value, options);
    value = this.parseJsonTypeInfo<R>(options, value);

    if (value && typeof value === 'object' && !(value instanceof Array)) {

      if (this.parseJsonIgnoreType<R>(options))
        return null;

      let replacement = value;
      replacement = this.parseJsonRootName<R>(replacement, options);

      this.parseJsonUnwrapped<R>(replacement, options);
      this.parseJsonPropertyAndJsonAlias<R>(replacement, options);

      for (let k in replacement) {
        if (Object.hasOwnProperty.call(replacement, k)) {
          if (this.parseHasJsonIgnore<R>(options, k) || !this.parseHasJsonView<R>(options, k)) {
            delete replacement[k];
          }
          else {
            this.parseJsonRawValue<R>(options, replacement, k);
            this.parseJsonDeserialize<R>(options, replacement,  k);
          }
        }
      }

      let jsonJsonCreator = this.parseJsonCreator(options, replacement);
      if (jsonJsonCreator)
        replacement = jsonJsonCreator;

      for (let k in value)
        if (Object.hasOwnProperty.call(value, k))
          this.parseJsonAnySetter(replacement, value, k);

      return replacement;
    }
    else if (value && value instanceof Array) {
      let arr: any = [];
      for(let obj of value)
        arr.push(this.deepParse(key, obj, options));

      return arr;
    }

    return value;
  }

  invokeCustomDeserializers<R>(key: string, value: any, options: JsonParserOptions<R>): any {
    if (options.deserializers) {
      for (const deserializer of options.deserializers) {
        if (deserializer.type != null) {
          if ( value != null &&
            (
              (typeof deserializer.type === "string" && deserializer.type !== typeof value) ||
              (typeof deserializer.type !== "string" && value.constructor != null && !isSameConstructor(deserializer.type, value.constructor))
            )
          ) {
            continue;
          }
        }
        value = deserializer.mapper(key, value);
      }
    }
    return value;
  }

  parseJsonCreator(options: JsonParserOptions<R>, obj: any) {
    if (obj) {
      //obj = this.parseJsonTypeInfo(options, obj);

      const hasJsonCreator = Reflect.hasMetadata("jackson:JsonCreator", options.mainCreator);

      const jsonCreator: JsonCreatorPrivateOptions = (hasJsonCreator) ? Reflect.getMetadata("jackson:JsonCreator", options.mainCreator) : options.mainCreator;
      const jsonIgnorePropertiesOptions: JsonIgnorePropertiesOptions = Reflect.getMetadata("jackson:JsonIgnoreProperties", options.mainCreator);

      const method = (hasJsonCreator) ? ((jsonCreator.constructor) ? jsonCreator.constructor : jsonCreator.method) : jsonCreator;

      const args = [];
      const argNames = getArgumentNames(method, !!jsonCreator.constructor);

      let argIndex = 0;
      for (let key of argNames) {
        const jsonProperty: JsonPropertyOptions = Reflect.getMetadata("jackson:JsonPropertyParam:" + argIndex, options.mainCreator);
        const mappedKey = jsonProperty != null ? jsonProperty.value : null;
        if (mappedKey && Object.hasOwnProperty.call(obj, mappedKey))
          args.push(this.parseJsonClass(options, obj, mappedKey));
        else if (mappedKey && jsonProperty.required)
          throw new Error(`Required property ${mappedKey} not found on @JsonCreator() of ${options.mainCreator.name} at [Source '${JSON.stringify(obj)}']`);
        else if (Object.hasOwnProperty.call(obj, key))
          args.push(this.parseJsonClass(options, obj, key));
        else if ((jsonIgnorePropertiesOptions == null && options.features[DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES]) ||
            (jsonIgnorePropertiesOptions != null && !jsonIgnorePropertiesOptions.ignoreUnknown))
          throw new Error(`Unknown property "${key}" for ${options.mainCreator.name} at [Source '${JSON.stringify(obj)}']`);
        else
          args.push(null)
        argIndex++;
      }

      let instance = (jsonCreator.constructor) ? new (method as ObjectConstructor)(...args) : (method as Function)(...args);

      this.parseJsonIdentityInfo<R>(instance, options, obj);

      // copy remaining properties and ignore the ones that are not part of "instance"
      let keys = Object.keys(obj).filter(n => !argNames.includes(n));
      for (let key of keys) {
        if (Object.hasOwnProperty.call(instance, key)) { // on TypeScript, set "useDefineForClassFields" option to true on the tsconfig.json file
          instance[key] = this.parseJsonClass(options, obj, key);
        } else if ((jsonIgnorePropertiesOptions == null && options.features[DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES]) ||
            (jsonIgnorePropertiesOptions != null && !jsonIgnorePropertiesOptions.ignoreUnknown)) {
          throw new Error(`Unknown property "${key}" for ${instance.constructor.name} at [Source '${JSON.stringify(obj)}']`);
        }
      }

      // if there is a reference, convert the reference property to the corresponding Class
      for (let key in instance) {
        if (Object.hasOwnProperty.call(instance, key)) {
          this.parseJsonManagedReference(instance, options, obj, key);
        }
      }

      return instance;
    }
  }

  parseJsonPropertyAndJsonAlias<R>(replacement: any, options: JsonParserOptions<R>) {
    // convert JsonProperty to Class properties
    const creatorMetadataKeys = Reflect.getMetadataKeys(options.mainCreator);

    for(const metadataKey of creatorMetadataKeys) {
      if (metadataKey.startsWith("jackson:JsonProperty:") || metadataKey.startsWith("jackson:JsonAlias:")) {

        const realKey = metadataKey.replace(metadataKey.startsWith("jackson:JsonProperty:") ? "jackson:JsonProperty:" : "jackson:JsonAlias:", "");
        const jsonProperty: JsonPropertyOptions = Reflect.getMetadata(metadataKey, options.mainCreator);
        const jsonAlias: JsonAliasOptions = Reflect.getMetadata(metadataKey, options.mainCreator);
        const hasJsonIgnore = Reflect.hasMetadata("jackson:JsonIgnore", options.mainCreator, realKey);

        const isIgnored = (jsonProperty && (jsonProperty.access === JsonPropertyAccess.READ_ONLY ||
          (jsonProperty.access === JsonPropertyAccess.AUTO && hasJsonIgnore))) || hasJsonIgnore;

        if (jsonProperty && !isIgnored && Object.hasOwnProperty.call(replacement, jsonProperty.value)) {
          replacement[realKey] = replacement[jsonProperty.value];
          if (realKey !== jsonProperty.value) {
            delete replacement[jsonProperty.value];
          }
        } else if (jsonProperty && jsonProperty.required) {
          throw new Error(`Required property "${jsonProperty.value}" not found at [Source '${JSON.stringify(replacement)}']`);
        } else if (jsonAlias && jsonAlias.values && !isIgnored) {
          for (const alias of jsonAlias.values) {
            if (Object.hasOwnProperty.call(replacement, alias)) {
              replacement[realKey] = replacement[alias];
              if (realKey !== alias) {
                delete replacement[alias];
              }
              break;
            }
          }
        }
        else if (isIgnored) {
          delete replacement[realKey];
        }
      }
    }
  }

  parseJsonRawValue<R>(options: JsonParserOptions<R>, replacement: any, key: string) {
    const jsonRawValue = Reflect.hasMetadata("jackson:JsonRawValue", options.mainCreator, key);
    if (jsonRawValue) {
      replacement[key] = JSON.stringify(replacement[key]);
      return true;
    }
    return false;
  }

  parseJsonRootName<R>(replacement: any, options: JsonParserOptions<R>) {
    const jsonRootName: string = Reflect.getMetadata("jackson:JsonRootName", options.mainCreator);
    if (jsonRootName)
      return replacement[jsonRootName];
    return replacement;
  }

  parseJsonClass(options: JsonParserOptions<R>, obj: any, key: string) {
    const jsonClass: JsonClassOptions = Reflect.getMetadata("jackson:JsonClass", options.mainCreator, key);

    if (jsonClass && jsonClass.class) {
      let newOptions = Object.assign(Object.create(options));
      newOptions.mainCreator = jsonClass.class();
      if (jsonClass.isArray && obj[key] instanceof Array) {
        let arr: any = [];
        for(let value of obj[key])
          arr.push(this.deepParse(key, value, newOptions));
        return arr;
      }
      return this.deepParse(key, obj[key], newOptions);
    }
    return obj[key];
  }

  parseJsonReferences(replacement: any, options: JsonParserOptions<R>, obj: any, key: string) {
    const jsonManagedReference: JsonManagedReferenceOptions = Reflect.getMetadata("jackson:JsonManagedReference", replacement.constructor, key);
    const jsonBackReference: JsonBackReferenceOptions = Reflect.getMetadata("jackson:JsonBackReference", replacement.constructor, key);
    const jsonReference = (jsonManagedReference && jsonManagedReference.class()) ? jsonManagedReference.class() : ( (jsonBackReference && jsonBackReference.class()) ? jsonBackReference.class() : null);
    let referenceConstructor = {};

    if (jsonReference && replacement[key]) {
      if (replacement[key] instanceof Array && replacement[key].length > 0 && replacement[key][0]) {
        if (!isSameConstructor(jsonReference, replacement[key][0].constructor) && !isExtensionOf(jsonReference, replacement[key][0].constructor)) {
          replacement[key] = this.parseJsonClass(options, obj, key);
        }
        referenceConstructor = replacement[key][0].constructor;
      }
      else if (replacement[key] instanceof Array && replacement[key].length === 0)
        referenceConstructor = {};
      else {
        if (!isSameConstructor(jsonReference, replacement[key].constructor) && !isExtensionOf(jsonReference, replacement[key].constructor)) {
          replacement[key] = this.parseJsonClass(options, obj, key);
        }
        referenceConstructor = replacement[key].constructor;
      }
    }

    return referenceConstructor;
  }

  parseJsonManagedReference(replacement: any, options: JsonParserOptions<R>, obj: any, key: string) {
    const jsonManagedReference: JsonManagedReferenceOptions = Reflect.getMetadata("jackson:JsonManagedReference", replacement.constructor, key);
    if (jsonManagedReference) {

      let referenceConstructor = this.parseJsonReferences(replacement, options, obj, key);

      if (isSameConstructor(jsonManagedReference.class(), referenceConstructor)) {
        const metadataKeys = Reflect.getMetadataKeys(referenceConstructor);

        const countBackReferences = {
          defaultReference: 0
        };

        for(let k of metadataKeys) {
          if (k.startsWith("jackson:JsonBackReference:")) {
            let propertyKey = k.replace("jackson:JsonBackReference:", '');
            let metadata: JsonBackReferenceOptions = Reflect.getMetadata(k, referenceConstructor);

            // check for multiple back-reference properties with same name
            if (metadata.value == null) {
              countBackReferences.defaultReference++;
              if (countBackReferences.defaultReference === 2) {
                throw new Error(`Multiple back-reference properties with name "defaultReference" at [Source '${JSON.stringify(obj)}']`);
              }
            } else {
              if (countBackReferences[metadata.value] == null) {
                countBackReferences[metadata.value] = 1;
              } else {
                countBackReferences[metadata.value]++;
              }
              if (countBackReferences.defaultReference === 2) {
                throw new Error(`Multiple back-reference properties with name "${metadata.value}" at [Source '${JSON.stringify(obj)}']`);
              }
            }

            if (metadata.value === jsonManagedReference.value && isSameConstructor(metadata.class(), replacement.constructor)) {
              if (replacement[key] instanceof Array) {
                for(let index in replacement[key]) {
                  replacement[key][index][propertyKey] = replacement;
                }
              }
              else {
                replacement[key][propertyKey] = replacement;
              }
            }
          }
        }
      }

    }
  }

  parseJsonAnySetter(replacement: any, value: any, key: string) {
    const jsonAnySetter: string = Reflect.getMetadata("jackson:JsonAnySetter", replacement);
    let jsonProperty: JsonPropertyOptions = Reflect.getMetadata("jackson:JsonProperty", replacement, key);
    if (!jsonProperty && jsonAnySetter && replacement[jsonAnySetter]) {
      if (typeof replacement[jsonAnySetter] === "function")
        replacement[jsonAnySetter](key, value[key]);
      else
        replacement[jsonAnySetter][key] = value[key];
    }
  }

  parseJsonDeserialize<R>(options: JsonParserOptions<R>, replacement: any, key: string) {
    const jsonDeserialize: (...args) => any = Reflect.getMetadata("jackson:JsonDeserialize", options.mainCreator, key);
    if (jsonDeserialize) {
      replacement[key] = jsonDeserialize(replacement[key]);
      return true;
    }
    return false;
  }

  parseHasJsonIgnore<R>(options: JsonParserOptions<R>, key: string) {
    const hasJsonIgnore = Reflect.hasMetadata("jackson:JsonIgnore", options.mainCreator, key);
    const hasJsonProperty = Reflect.hasMetadata("jackson:JsonProperty:" + key, options.mainCreator);

    if (!hasJsonIgnore) {
      let jsonIgnoreProperties: JsonIgnorePropertiesOptions = Reflect.getMetadata("jackson:JsonIgnoreProperties", options.mainCreator);
      if (jsonIgnoreProperties && !jsonIgnoreProperties.allowSetters) {
        if (jsonIgnoreProperties.value.indexOf(key) >= 0)
          return true;
        let jsonProperty: JsonPropertyOptions = Reflect.getMetadata("jackson:JsonProperty:"+key, options.mainCreator);
        if (jsonProperty && jsonIgnoreProperties.value.indexOf(jsonProperty.value) >= 0)
          return true;
      }
    }
    return hasJsonIgnore && !hasJsonProperty;
  }

  parseJsonIgnoreType<R>(options: JsonParserOptions<R>) {
    return Reflect.hasMetadata("jackson:JsonIgnoreType", options.mainCreator);
  }

  parseJsonTypeInfo<R>(options: JsonParserOptions<R>, obj: any) {
    const jsonTypeInfo: JsonTypeInfoOptions = Reflect.getMetadata("jackson:JsonTypeInfo", options.mainCreator);

    if (jsonTypeInfo) {
      let jsonTypeCtor: ClassType<R>;
      let jsonTypeInfoProperty: string;
      let newObj = obj;

      switch(jsonTypeInfo.include) {
        case JsonTypeInfoAs.PROPERTY:
          jsonTypeInfoProperty = obj[jsonTypeInfo.property];
          if (jsonTypeInfoProperty == null) {
            throw new Error(`Missing type id when trying to resolve subtype of class ${options.mainCreator.name}: missing type id property '${jsonTypeInfo.property}' at [Source '${JSON.stringify(obj)}']`);
          }
          delete obj[jsonTypeInfo.property];
          break;
        case JsonTypeInfoAs.WRAPPER_OBJECT:
          if (!(obj instanceof Object) || obj instanceof Array) {
            throw new Error(`Expected "Object", got "${obj.constructor.name}": need JSON Object to contain JsonTypeInfoAs.WRAPPER_OBJECT type information for class "${options.mainCreator.name}" at [Source '${JSON.stringify(obj)}']`);
          }
          jsonTypeInfoProperty = Object.keys(obj)[0];
          newObj = obj[jsonTypeInfoProperty];
          break;
        case JsonTypeInfoAs.WRAPPER_ARRAY:
          if (!(obj instanceof Array)) {
            throw new Error(`Expected "Array", got "${obj.constructor.name}": need JSON Array to contain JsonTypeInfoAs.WRAPPER_ARRAY type information for class "${options.mainCreator.name}" at [Source '${JSON.stringify(obj)}']`);
          } else if (obj.length > 2 || obj.length === 0) {
            throw new Error(`Expected "Array" of length 1 or 2, got "Array" of length ${obj.length}: need JSON Array of length 1 or 2 to contain JsonTypeInfoAs.WRAPPER_ARRAY type information for class "${options.mainCreator.name}" at [Source '${JSON.stringify(obj)}']`);
          } else if (typeof obj[0] !== "string") {
            throw new Error(`Expected "String", got "${obj[0].constructor.name}": need JSON String that contains type id (for subtype of "${options.mainCreator.name}") at [Source '${JSON.stringify(obj)}']`);
          }
          jsonTypeInfoProperty = obj[0];
          newObj = obj[1];
          break;
      }

      const jsonSubTypes: JsonSubTypeOptions[] = Reflect.getMetadata("jackson:JsonSubTypes", options.mainCreator);

      if (jsonSubTypes) {
        for (const subType of jsonSubTypes) {
          if (subType.name != null && jsonTypeInfoProperty === subType.name) {
            jsonTypeCtor = subType.class();
          } else {
            const ctor = Reflect.getMetadata("jackson:JsonTypeName:" + jsonTypeInfoProperty, subType.class());
            if (ctor) {
              jsonTypeCtor = ctor;
            }
          }
        }
      }

      if (!jsonTypeCtor) {
        jsonTypeCtor = options.mainCreator;
        switch(jsonTypeInfo.use) {
          case JsonTypeInfoId.NAME:
            jsonTypeCtor = options.mainCreator;
            break;
        }
      }

      switch(jsonTypeInfo.include) {
        case JsonTypeInfoAs.WRAPPER_OBJECT:
          if (!isSameConstructor(jsonTypeInfoProperty, jsonTypeCtor)) {
            const ids = [options.mainCreator.name];
            if (jsonSubTypes) {
              ids.push(...jsonSubTypes.map((subType) => subType.class().name));
            }
            throw new Error(`Could not resolve type id "${jsonTypeInfoProperty}" as a subtype of "${options.mainCreator.name}": known type ids = [${ids.join(', ')}] at [Source '${JSON.stringify(obj)}']`);
          }
          break;
      }

      options.mainCreator = jsonTypeCtor;
      return newObj;
    }

    return obj;
  }

  parseHasJsonView<R>(options: JsonParserOptions<R>, key: string) {
    if (options.withView) {
      const jsonView: JsonViewOptions = Reflect.getMetadata("jackson:JsonView", options.mainCreator, key);
      if (jsonView) {
        for (const view of jsonView.value) {
          if (isSameConstructor(view(), options.withView) || isExtensionOf(view(), options.withView)) {
            return true;
          }
        }
        return false;
      }
    }
    return true;
  }

  parseJsonUnwrapped<R>(replacement: any, options: JsonParserOptions<R>) {
    const metadataKeys: string[] = Reflect.getMetadataKeys(options.mainCreator);
    for(const metadataKey of metadataKeys) {
      if (metadataKey.startsWith("jackson:JsonUnwrapped:")) {
        const realKey = metadataKey.replace("jackson:JsonUnwrapped:", '');
        const jsonUnwrapped: JsonUnwrappedOptions = Reflect.getMetadata(metadataKey, options.mainCreator);

        const prefix = (jsonUnwrapped.prefix != null) ? jsonUnwrapped.prefix : '';
        const suffix = (jsonUnwrapped.suffix != null) ? jsonUnwrapped.suffix : '';

        replacement[realKey] = {};

        for (let k in replacement) {
          if (k.startsWith(prefix) && k.endsWith(suffix) && Object.hasOwnProperty.call(replacement, k)) {
            const unwrappedKey = k.substr(prefix.length, k.length - suffix.length);
            replacement[realKey][unwrappedKey] = replacement[k];
            delete replacement[k];
          }
        }
      }
    }
  }

  parseJsonIdentityInfo<R>(replacement: any, options: JsonParserOptions<R>, obj: any) {
    const jsonIdentityInfo: JsonIdentityInfoOptions = Reflect.getMetadata("jackson:JsonIdentityInfo", options.mainCreator);

    if (jsonIdentityInfo) {
      const id: string = obj[jsonIdentityInfo.property];
      if (!this._valueAlreadySeen.has(id)) {
        this._valueAlreadySeen.set(id, replacement);
      }

      for (let k in replacement) {
        if (Object.hasOwnProperty.call(replacement, k)) {
          const hasJsonClass = Reflect.hasMetadata("jackson:JsonClass", replacement, k);
          if (hasJsonClass) {
            const instance = this._valueAlreadySeen.get(obj[k]);
            if (instance) {
              replacement[k] = instance;
            }
          }
        }
      }

      delete obj[jsonIdentityInfo.property];
    }
  }
}