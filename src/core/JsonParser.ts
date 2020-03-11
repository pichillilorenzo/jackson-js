import {JsonCreatorPrivateOptions} from "../annotations/JsonCreator";
import {getArgumentNames, isExtensionOf, isSameConstructor} from "../util";
import {
  JsonAliasOptions,
  JsonBackReferenceOptions,
  JsonClassOptions, JsonIgnorePropertiesOptions,
  JsonManagedReferenceOptions, JsonParserOptions,
  JsonPropertyOptions, JsonSubTypeOptions, JsonTypeInfoOptions, JsonViewOptions
} from "../@types";
import {JsonPropertyAccess} from "../annotations/JsonProperty";
import {JsonTypeInfoAs, JsonTypeInfoId} from "../annotations/JsonTypeInfo";

export class JsonParser {
  static parse<T>(text: string, reviver?: (key: string, value: any) => any, options: JsonParserOptions<T> = {mainCreator: null, withView: null}): T {
    if (options.mainCreator) {
      const value = JSON.parse(text);
      return JsonParser.deepParse<T>('', value, reviver, options)
    }
    return JSON.parse(text, reviver);
  }

  private static deepParse<T>(key: string, value: any, reviver: (key: string, value: any) => any, options: JsonParserOptions<T>): T {
    if (value && typeof value === 'object' && !(value instanceof Array)) {
      if (JsonParser.parseJsonIgnoreType<T>(options))
        return null;

      let replacement = value;
      replacement = JsonParser.parseJsonRootName<T>(replacement, reviver, options);

      JsonParser.parseJsonPropertyAndJsonAlias<T>(replacement, options);

      for (let k in replacement) {
        if (Object.hasOwnProperty.call(replacement, k)) {
          if (JsonParser.parseHasJsonIgnore<T>(options, k) || !JsonParser.parseHasJsonView<T>(options, k)) {
            delete replacement[k];
          }
          else {
            JsonParser.parseJsonRawValue<T>(options, replacement, k);
            JsonParser.parseJsonDeserialize<T>(options, replacement,  k);
          }
        }
      }

      let jsonJsonCreator = JsonParser.parseJsonCreator<T>(reviver, options, replacement);
      if (jsonJsonCreator)
        replacement = jsonJsonCreator;

      for (let k in value)
        if (Object.hasOwnProperty.call(value, k))
          JsonParser.parseJsonAnySetter(replacement, value, k);

      if (reviver)
        for (let key in replacement)
          if (Object.hasOwnProperty.call(replacement, key))
            replacement[key] = reviver(key, replacement[key]);

      return (reviver) ? reviver(key, replacement) : replacement;
    }
    else if (value && value instanceof Array) {
      const jsonTypeInfo = JsonParser.parseJsonTypeInfo<T>(options, value);
      if (jsonTypeInfo && options.mainCreator !== jsonTypeInfo.creator) {
        options.mainCreator = jsonTypeInfo.creator;
        return JsonParser.deepParse<T>(key, jsonTypeInfo.newObj, reviver, options);
      }

      let arr = [];
      for(let obj of value)
        arr.push(JsonParser.deepParse<T>(key, obj, reviver, options));
      return (reviver) ? reviver(key, arr) : arr;
    }
    return (reviver) ? reviver(key, value) : value;
  }

  static parseJsonCreator<T>(reviver: (key: string, value: any) => any, options: JsonParserOptions<T>, obj: any) {
    if (obj) {
      const jsonTypeInfo = JsonParser.parseJsonTypeInfo(options, obj);
      if (jsonTypeInfo) {
        options.mainCreator = jsonTypeInfo.creator;
        obj = jsonTypeInfo.newObj;
      }

      const hasJsonCreator = Reflect.hasMetadata("jackson:JsonCreator", options.mainCreator);

      const jsonCreator: JsonCreatorPrivateOptions = (hasJsonCreator) ? Reflect.getMetadata("jackson:JsonCreator", options.mainCreator) : options.mainCreator;

      const method = (hasJsonCreator) ? ((jsonCreator.constructor) ? jsonCreator.constructor : jsonCreator.method) : jsonCreator;

      const args = [];
      const argNames = getArgumentNames(method, !!jsonCreator.constructor);

      let argIndex = 0;
      const objValues = Object.values(obj);
      for (let key of argNames) {
        const jsonProperty: JsonPropertyOptions = Reflect.getMetadata("jackson:JsonPropertyParam:" + argIndex, options.mainCreator);
        const mappedKey = jsonProperty != null ? jsonProperty.value : null;
        if (mappedKey && Object.hasOwnProperty.call(obj, mappedKey))
          args.push(JsonParser.parseJsonClass<T>(reviver, options, obj, mappedKey));
        else if (jsonProperty != null && jsonProperty.required) {
          throw new Error(`Required property ${mappedKey ? mappedKey : key} not found on @JsonConstructor`);
        }
        else if (Object.hasOwnProperty.call(obj, key))
          args.push(JsonParser.parseJsonClass<T>(reviver, options, obj, key));
        else if (argIndex < objValues.length)
          args.push(objValues[argIndex]);
        else
          args.push(null)
        argIndex++;
      }

      let instance = (jsonCreator.constructor) ? new (method as ObjectConstructor)(...args) : (method as Function)(...args);

      // copy remaining properties and ignore the ones that are not part of "instance"
      let keys = Object.keys(obj).filter(n => !argNames.includes(n));
      for (let key of keys) {
        if (Object.hasOwnProperty.call(instance, key)) { // on TypeScript, set "useDefineForClassFields" option to true on the tsconfig.json file
          instance[key] = JsonParser.parseJsonClass<T>(reviver, options, obj, key);
        }
      }

      // if there is a reference, convert the reference property to the corresponding Class
      for (let key in instance) {
        if (Object.hasOwnProperty.call(instance, key)) {
          JsonParser.parseJsonManagedReference<T>(instance, reviver, options, obj, key);
        }
      }

      return instance;
    }
  }

  static parseJsonPropertyAndJsonAlias<T>(replacement: any, options: JsonParserOptions<T>) {
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
          throw new Error(`Required property "${jsonProperty.value}" not found!`);
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

  static parseJsonRawValue<T>(options: JsonParserOptions<T>, replacement: any, key: string) {
    const jsonRawValue = Reflect.hasMetadata("jackson:JsonRawValue", options.mainCreator, key);
    if (jsonRawValue) {
      replacement[key] = JSON.stringify(replacement[key]);
      return true;
    }
    return false;
  }

  static parseJsonRootName<T>(replacement: any, reviver: (key: string, value: any) => any, options: JsonParserOptions<T>) {
    const jsonRootName: string = Reflect.getMetadata("jackson:JsonRootName", options.mainCreator);
    if (jsonRootName)
      return replacement[jsonRootName];
    return replacement;
  }

  static parseJsonClass<T>(reviver: (key: string, value: any) => any, options: JsonParserOptions<T>, obj: any, key: string) {
    const jsonClass: JsonClassOptions = Reflect.getMetadata("jackson:JsonClass", options.mainCreator, key);

    if (jsonClass && jsonClass.class) {
      let newOptions = Object.assign(Object.create(options));
      newOptions.mainCreator = jsonClass.class();
      return JsonParser.deepParse<T>(key, obj[key], reviver, newOptions);
    }
    return obj[key];
  }

  static parseJsonReferences<T>(replacement: any, reviver: (key: string, value: any) => any, options: JsonParserOptions<T>, obj: any, key: string) {
    const jsonManagedReference: JsonManagedReferenceOptions = Reflect.getMetadata("jackson:JsonManagedReference", replacement.constructor, key);
    const jsonBackReference: JsonBackReferenceOptions = Reflect.getMetadata("jackson:JsonBackReference", replacement.constructor, key);
    const jsonReference = (jsonManagedReference && jsonManagedReference.class()) ? jsonManagedReference.class() : ( (jsonBackReference && jsonBackReference.class()) ? jsonBackReference.class() : null);
    let referenceConstructor = {};

    if (jsonReference && replacement[key]) {
      if (replacement[key] instanceof Array && replacement[key].length > 0 && replacement[key][0]) {
        if (!isSameConstructor(jsonReference, replacement[key][0].constructor) && !isExtensionOf(jsonReference, replacement[key][0].constructor)) {
          replacement[key] = JsonParser.parseJsonClass<T>(reviver, options, obj, key);
        }
        referenceConstructor = replacement[key][0].constructor;
      }
      else if (replacement[key] instanceof Array && replacement[key].length === 0)
        referenceConstructor = {};
      else {
        if (!isSameConstructor(jsonReference, replacement[key].constructor) && !isExtensionOf(jsonReference, replacement[key].constructor)) {
          replacement[key] = JsonParser.parseJsonClass<T>(reviver, options, obj, key);
        }
        referenceConstructor = replacement[key].constructor;
      }
    }

    return referenceConstructor;
  }

  static parseJsonManagedReference<T>(replacement: any, reviver: (key: string, value: any) => any, options: JsonParserOptions<T>, obj: any, key: string) {
    const jsonManagedReference: JsonManagedReferenceOptions = Reflect.getMetadata("jackson:JsonManagedReference", replacement.constructor, key);
    if (jsonManagedReference) {

      let referenceConstructor = JsonParser.parseJsonReferences<T>(replacement, reviver, options, obj, key);

      if (isSameConstructor(jsonManagedReference.class(), referenceConstructor)) {
        const metadataKeys = Reflect.getMetadataKeys(referenceConstructor);
        let defaultReferences = 0;
        for(let k of metadataKeys) {
          if (k.startsWith("jackson:JsonBackReference:")) {
            let propertyKey = k.replace("jackson:JsonBackReference:", '');
            let metadata: JsonBackReferenceOptions = Reflect.getMetadata(k, referenceConstructor);
            if (metadata.value == null) {
              defaultReferences++;
              if (defaultReferences === 2) {
                throw new Error("Multiple back-reference properties with name default reference");
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

  static parseJsonAnySetter(replacement: any, value: any, key: string) {
    const jsonAnySetter: string = Reflect.getMetadata("jackson:JsonAnySetter", replacement);
    let jsonProperty: JsonPropertyOptions = Reflect.getMetadata("jackson:JsonProperty", replacement, key);
    if (!jsonProperty && jsonAnySetter && replacement[jsonAnySetter]) {
      if (typeof replacement[jsonAnySetter] === "function")
        replacement[jsonAnySetter](key, value[key]);
      else
        replacement[jsonAnySetter][key] = value[key];
    }
  }

  static parseJsonDeserialize<T>(options: JsonParserOptions<T>, replacement: any, key: string) {
    const jsonDeserialize: (...args) => any = Reflect.getMetadata("jackson:JsonDeserialize", options.mainCreator, key);
    if (jsonDeserialize) {
      replacement[key] = jsonDeserialize(replacement[key]);
      return true;
    }
    return false;
  }

  static parseHasJsonIgnore<T>(options: JsonParserOptions<T>, key: string) {
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

  static parseJsonIgnoreType<T>(options: JsonParserOptions<T>) {
    return Reflect.hasMetadata("jackson:JsonIgnoreType", options.mainCreator);
  }

  static parseJsonTypeInfo<T>(options: JsonParserOptions<T>, obj: any) {
    const jsonTypeInfo: JsonTypeInfoOptions = Reflect.getMetadata("jackson:JsonTypeInfo", options.mainCreator);

    if (jsonTypeInfo) {
      let jsonTypeCtor: { new(): T };
      let jsonTypeInfoProperty: string;
      let newObj = obj;

      switch(jsonTypeInfo.include) {
        case JsonTypeInfoAs.PROPERTY:
          jsonTypeInfoProperty = obj[jsonTypeInfo.property];
          break;
        case JsonTypeInfoAs.WRAPPER_OBJECT:
          jsonTypeInfoProperty = Object.keys(obj)[0];
          newObj = obj[jsonTypeInfoProperty];
          break;
        case JsonTypeInfoAs.WRAPPER_ARRAY:
          jsonTypeInfoProperty = obj[0];
          newObj = obj[1];
          break;
      }

      const jsonSubTypes: JsonSubTypeOptions[] = Reflect.getMetadata("jackson:JsonSubTypes", options.mainCreator);

      if (jsonSubTypes) {
        for (const subType of jsonSubTypes) {
          if (subType.name != null && jsonTypeInfoProperty === subType.name) {
            jsonTypeCtor = subType.class() as { new(): T };
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
          case JsonTypeInfoId.CLASS:
            jsonTypeCtor = options.mainCreator;
            break;
        }
      }

      return {creator: jsonTypeCtor, newObj};
    }
  }

  static parseHasJsonView<T>(options: JsonParserOptions<T>, key: string) {
    if (options.withView) {
      const jsonView: JsonViewOptions = Reflect.getMetadata("jackson:JsonView", options.mainCreator, key);
      if (jsonView) {
        return isSameConstructor(jsonView.value(), options.withView) || isExtensionOf(jsonView.value(), options.withView);
      }
    }
    return true;
  }
}