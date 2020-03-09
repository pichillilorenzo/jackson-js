import "reflect-metadata";
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import { getArgumentNames, cloneClassInstance, isSameConstructor, isExtensionOf } from './util';
import {
  JsonBackReferenceOptions, JsonFormatOptions,
  JsonIgnorePropertiesOptions, JsonIncludeOptions, JsonManagedReferenceOptions,
  JsonPropertyOptions, JsonPropertyOrderOptions, JsonSubTypeOptions,
  JsonTypeInfoOptions, JsonViewOptions
} from "./@types";
import {JsonIncludeType} from "./annotations/JsonInclude";
import {JsonTypeInfoAs, JsonTypeInfoId} from "./annotations/JsonTypeInfo";
import { JsonFormatShape } from './annotations/JsonFormat';
import {JsonCreatorPrivateOptions} from "./annotations/JsonCreator";

dayjs.extend(customParseFormat);

export const day_js = dayjs;

export function stringify(obj, replacer, format, options={view: null}) {
  options = Object.assign({view: null}, options);

  return JSON.stringify(obj, (key, value=null) => {
    if (value && typeof value === 'object' && !(value instanceof Array)) {
      if (stringifyJsonIgnoreType(value))
        return null;
        
      let replacement;
      let jsonValue = stringifyJsonValue(value);
      if (jsonValue)
        replacement = jsonValue;

      if (!replacement) {
        replacement = {};
        let keys = stringifyJsonPropertyOrder(value);
        for (let k of keys) {
          if (!stringifyHasJsonIgnore(value, k) && !stringifyJsonInclude(value, k) && stringifyHasJsonView(value, k, options) && Object.hasOwnProperty.call(value, k)) {
            replacement[k] = value[k];
            stringifyJsonFormat(replacement, value, k);
            stringifyJsonSerialize(replacement, value, k);
            stringifyJsonRawValue(replacement, value, k);
            stringifyJsonProperty(replacement, value, k);
            stringifyJsonManagedReference(replacement, value, k);
            //stringifyJsonBackReference(replacement, value, k);
            stringifyJsonAnyGetter(replacement, value, k);
          }
        }
      }

      replacement = stringifyJsonTypeInfo(replacement, value);
      replacement = stringifyJsonRootName(replacement, value);

      return (replacer) ? replacer(key, replacement) : replacement;
    }
    
    return (replacer) ? replacer(key, value) : value;
  }, format);
}

export function parse(text, reviver, options = {mainCreator: null, otherCreators: [], view: null}) {
  options = Object.assign({otherCreators: [], view: null}, options);
  
  if (options.mainCreator) {
    options.otherCreators.push(options.mainCreator);
    let value = JSON.parse(text);
    return deepParse('', value, reviver, options)
  }
  return JSON.parse(text, reviver);
}

function deepParse(key, value, reviver, options) {
  if (value && typeof value === 'object' && !(value instanceof Array)) {
    if (parseJsonIgnoreType(options))
      return null;

    let replacement = value;
    replacement = parseJsonRootName(replacement, reviver, options);
    
    // convert JsonProperty to Class properties
    const creatorMetadataKeys = Reflect.getMetadataKeys(options.mainCreator);
    for(const metadataKey of creatorMetadataKeys) {
      if (metadataKey.startsWith("jackson:JsonProperty:")) {
        const metadata: JsonPropertyOptions = Reflect.getMetadata(metadataKey, options.mainCreator);
        const realKey = metadataKey.replace("jackson:JsonProperty:", "");
        if (Object.hasOwnProperty.call(replacement, metadata.value)) {
          replacement[realKey] = replacement[metadata.value];
          delete replacement[metadata.value];
        }
      }
    }
    
    for (let k in replacement) {
      if (Object.hasOwnProperty.call(replacement, k)) {
        if (parseHasJsonIgnore(options, k) || !parseHasJsonView(options, k)) {
          delete replacement[k];
        }
        else {
          parseJsonRawValue(options, replacement, k);
          parseJsonDeserialize(options, replacement,  k);
        }
      }
    }

    let jsonJsonCreator = parseJsonCreator(reviver, options, replacement);
    if (jsonJsonCreator)
      replacement = jsonJsonCreator;

    for (let k in value)
      if (Object.hasOwnProperty.call(value, k))
        parseJsonAnySetter(replacement, value, k);
    
    if (reviver)
      for (let key in replacement)
        if (Object.hasOwnProperty.call(replacement, key))
          replacement[key] = reviver(key, replacement[key]);

    return (reviver) ? reviver(key, replacement) : replacement;
  }
  else if (value && value instanceof Array) {
    const jsonTypeInfo = parseJsonTypeInfo(options, value);
    if (jsonTypeInfo && options.mainCreator !== jsonTypeInfo.creator) {
      options.mainCreator = jsonTypeInfo.creator;
      return deepParse(key, jsonTypeInfo.newObj, reviver, options);
    }
    
    let arr = [];
    for(let obj of value)
      arr.push(deepParse(key, obj, reviver, options));
    return (reviver) ? reviver(key, arr) : arr;
  }
  return (reviver) ? reviver(key, value) : value;
}

function stringifyJsonAnyGetter(replacement, obj, key) {
  const jsonAnyGetter: string = Reflect.getMetadata("jackson:JsonAnyGetter", obj);
  let jsonProperty: JsonPropertyOptions = Reflect.getMetadata("jackson:JsonProperty", obj, key);
  if (!jsonProperty && jsonAnyGetter && obj[jsonAnyGetter]) {
    let value = (typeof obj[jsonAnyGetter] === "function") ? obj[jsonAnyGetter]() : obj[jsonAnyGetter];
    for (let k in value)
      if (Object.hasOwnProperty.call(value, k))
        replacement[k] = value[k];
    delete replacement[key];
  }
}

function stringifyJsonPropertyOrder(obj) {
  let keys = Object.keys(obj);
  const jsonPropertyOrder: JsonPropertyOrderOptions = Reflect.getMetadata("jackson:JsonPropertyOrder", obj.constructor);
  if (jsonPropertyOrder) {
    if (jsonPropertyOrder.alphabetic)
      keys = keys.sort();
    else if (jsonPropertyOrder.value)
      keys = jsonPropertyOrder.value.concat(keys.filter(item => !jsonPropertyOrder.value.includes(item)))
  }
  return keys;
}

function stringifyJsonProperty(replacement, obj, key) {
  const jsonProperty: JsonPropertyOptions = Reflect.getMetadata("jackson:JsonProperty", obj, key);
  const hasJsonIgnore = Reflect.hasMetadata("jackson:JsonIgnore", obj.constructor, key);
  if (jsonProperty && !hasJsonIgnore && jsonProperty.value !== key) {
    replacement[jsonProperty.value] = replacement[key];
    delete replacement[key];
    return true;
  }
  return false;
}

function stringifyJsonRawValue(replacement, obj, key) {
  const jsonRawValue = Reflect.hasMetadata("jackson:JsonRawValue", obj.constructor, key);
  if (jsonRawValue) {
    replacement[key] = JSON.parse(replacement[key]);
    return true;
  }
  return false;
}

function stringifyJsonValue(obj) {
  const jsonValue: string = Reflect.getMetadata("jackson:JsonValue", obj);
  if (jsonValue) 
    return obj[jsonValue]();
}

function stringifyJsonRootName(replacement, obj) {
  const jsonRootName: string = Reflect.getMetadata("jackson:JsonRootName", obj.constructor);
  if (jsonRootName) {
    let newReplacement = {};
    newReplacement[jsonRootName] = replacement;
    return newReplacement;
  }
  return replacement;
}

function stringifyJsonSerialize(replacement, obj, key) {
  const jsonSerialize: (...args) => any = Reflect.getMetadata("jackson:JsonSerialize", obj, key);
  if (jsonSerialize) {
    replacement[key] = jsonSerialize(replacement[key]);
    return true;
  }
  return false;
}

function stringifyHasJsonIgnore(obj, key) {
  const hasJsonIgnore = Reflect.hasMetadata("jackson:JsonIgnore", obj.constructor, key);
  const hasJsonProperty = Reflect.hasMetadata("jackson:JsonProperty", obj, key);
  
  if (!hasJsonIgnore) {
    const jsonIgnoreProperties: JsonIgnorePropertiesOptions = Reflect.getMetadata("jackson:JsonIgnoreProperties", obj.constructor);
    if (jsonIgnoreProperties && !jsonIgnoreProperties.allowGetters) {
      if (jsonIgnoreProperties.value.indexOf(key) >= 0)
        return true;
      const jsonProperty: JsonPropertyOptions = Reflect.getMetadata("jackson:JsonProperty", obj, key);
      if (jsonProperty && jsonIgnoreProperties.value.indexOf(jsonProperty.value) >= 0)
        return true;
    }
  }
  
  return hasJsonIgnore && !hasJsonProperty;
}

function stringifyJsonInclude(obj, key) {
  const keyJsonInclude: JsonIncludeOptions = Reflect.getMetadata("jackson:JsonInclude", obj, key);
  const constructorJsonInclude: JsonIncludeOptions = Reflect.getMetadata("jackson:JsonInclude", obj.constructor);
  const jsonInclude = (keyJsonInclude) ? keyJsonInclude : constructorJsonInclude;

  if (jsonInclude && jsonInclude.value >= JsonIncludeType.ALWAYS) {
    const value = obj[key];
    switch(jsonInclude.value) {
      case JsonIncludeType.NON_EMPTY:
        return value == null || ((typeof value === "object" || typeof value === "string") && Object.keys(value).length === 0);
      case JsonIncludeType.NON_NULL:
        return value == null;
    }
  }

  return false;
}

function stringifyJsonIgnoreType(obj) {
  return Reflect.hasMetadata("jackson:JsonIgnoreType", obj.constructor);
}

function stringifyJsonManagedReference(replacement, obj, key) {
  const jsonManagedReference: JsonManagedReferenceOptions = Reflect.getMetadata("jackson:JsonManagedReference", obj.constructor, key);
  if (jsonManagedReference) {

    let referenceConstructor;
    if (replacement[key]) {
      if (replacement[key] instanceof Array && replacement[key].length > 0)
        referenceConstructor = replacement[key][0].constructor;
      else if (replacement[key] instanceof Array && replacement[key].length === 0)
        referenceConstructor = {};
      else
        referenceConstructor = replacement[key].constructor;
    }
    else
      referenceConstructor = {};

    if (isSameConstructor(jsonManagedReference.class(), referenceConstructor)) {
      const metadataKeys = Reflect.getMetadataKeys(referenceConstructor);
      for(let k of metadataKeys) {
        if (k.startsWith("jackson:JsonBackReference:")) {
          let propertyKey = k.replace("jackson:JsonBackReference:", '');
          let metadata: JsonBackReferenceOptions = Reflect.getMetadata(k, referenceConstructor);
          if (isSameConstructor(metadata.class(), obj.constructor)) {
            if (replacement[key] instanceof Array) {
              for(let index in replacement[key]) {
                replacement[key][index] = cloneClassInstance(obj[key][index]);
                delete replacement[key][index][propertyKey];
              }
            }
            else {
              replacement[key] = cloneClassInstance(obj[key]);
              delete replacement[key][propertyKey];
            }
          } else {
            if (replacement[key] instanceof Array) {
              for(let index in replacement[key]) {
                delete replacement[key][index][propertyKey];
              }
            }
            else {
              delete replacement[key][propertyKey];
            }
          }
        }
      }
    }
    
  }
}

function stringifyJsonBackReference(replacement, obj, key) {
  const jsonBackReference: JsonBackReferenceOptions = Reflect.getMetadata("jackson:JsonBackReference", obj.constructor, key);
  if (jsonBackReference) {
    
    let referenceConstructor;
    if (replacement[key]) {
      if (replacement[key] instanceof Array && replacement[key].length > 0)
        referenceConstructor = replacement[key][0].constructor;
      else if (replacement[key] instanceof Array && replacement[key].length === 0)
        referenceConstructor = {};
      else
        referenceConstructor = replacement[key].constructor;
    }
    else
      referenceConstructor = {};
    
    if (isSameConstructor(jsonBackReference.class(), referenceConstructor)) {
      const metadataKeys = Reflect.getMetadataKeys(referenceConstructor);
      for(const k of metadataKeys) {
        if (k.startsWith("jackson:JsonManagedReference:")) {
          const propertyKey = k.replace("jackson:JsonManagedReference:", '');
          let metadata: JsonManagedReferenceOptions = Reflect.getMetadata(k, referenceConstructor);
          if (isSameConstructor(metadata.class(), obj.constructor)) {
            if (replacement[key] instanceof Array) {
              for(let index in replacement[key]) {
                replacement[key][index] = cloneClassInstance(obj[key][index]);
                delete replacement[key][index][propertyKey];
              }
            }
            else {
              replacement[key] = cloneClassInstance(obj[key]);
              delete replacement[key][propertyKey];
            }
          } else {
            if (replacement[key] instanceof Array) {
              for(let index in replacement[key]) {
                delete replacement[key][index][propertyKey];
              }
            }
            else {
              delete replacement[key][propertyKey];
            }
          }
        }
      }
    }
  }
}

function stringifyJsonTypeInfo(replacement, obj) {
  const jsonTypeInfo: JsonTypeInfoOptions = Reflect.getMetadata("jackson:JsonTypeInfo", obj.constructor);
  if (jsonTypeInfo) {
    let jsonTypeName: string;

    const jsonSubTypes: JsonSubTypeOptions[] = Reflect.getMetadata("jackson:JsonSubTypes", obj.constructor);
    if (jsonSubTypes) {
      for(const subType of jsonSubTypes) {
        if(subType.name && isSameConstructor(subType.class(), obj.constructor)) {
          jsonTypeName = subType.name;
          break;
        }
      }
    }
    
    if (!jsonTypeName)
      jsonTypeName = Reflect.getMetadata("jackson:JsonTypeName", obj.constructor);

    switch(jsonTypeInfo.use) {
      case JsonTypeInfoId.CLASS:
        jsonTypeName = obj.constructor.name;
        break;
    }

    let newReplacement: any;
    switch(jsonTypeInfo.include) {
      case JsonTypeInfoAs.PROPERTY:
        replacement[jsonTypeInfo.property] = jsonTypeName;
        break;
      case JsonTypeInfoAs.WRAPPER_OBJECT:
        newReplacement = {};
        newReplacement[jsonTypeName] = replacement;
        replacement = newReplacement;
        break;
      case JsonTypeInfoAs.WRAPPER_ARRAY:
        newReplacement = [jsonTypeName, replacement];
        replacement = newReplacement;
        break;
    }

  }
  return replacement;
}

function stringifyJsonFormat(replacement, obj, key) {
  const jsonFormat: JsonFormatOptions = Reflect.getMetadata("jackson:JsonFormat", obj, key);
  
  if (jsonFormat) {
    switch(jsonFormat.shape) {
      case JsonFormatShape.ARRAY:
        if (typeof replacement[key] === "object")
          replacement[key] = Object.values(replacement[key]);
        else
          replacement[key] = [replacement[key]];
        break;
      case JsonFormatShape.BOOLEAN:
        replacement[key] = !!replacement[key];
        break;
      case JsonFormatShape.NUMBER_FLOAT:
        if (replacement[key] instanceof Date)
          replacement[key] = parseFloat(replacement[key].getTime());
        else
          replacement[key] = parseFloat(replacement[key]);
        break;
      case JsonFormatShape.NUMBER_INT:
        if (replacement[key] instanceof Date)
          replacement[key] = replacement[key].getTime();
        else
          replacement[key] = parseInt(replacement[key]);
        break;
      case JsonFormatShape.OBJECT:
        replacement[key] = Object.assign(Object.create(replacement[key]), replacement[key]);
        break;
      case JsonFormatShape.SCALAR:
        if (typeof replacement[key] === "object")
          replacement[key] = null;
        break;
      case JsonFormatShape.STRING:
        if (replacement[key] instanceof Date) {
          const locale = jsonFormat.locale;
          require('dayjs/locale/'+locale);
          const timezone = (jsonFormat.timezone) ? { timeZone: jsonFormat.timezone } : {};
          replacement[key] = dayjs(replacement[key].toLocaleString('en-US', timezone)).locale(locale).format(jsonFormat.pattern);
        }
        else
          replacement[key] = replacement[key].toString();
        break;
    }
  }
}

function stringifyHasJsonView(obj, key, options) {
  if (options.view) {
    const jsonView: JsonViewOptions = Reflect.getMetadata("jackson:JsonView", obj.constructor, key);
    if (jsonView) {
      return isSameConstructor(jsonView.value(), options.view) || isExtensionOf(jsonView.value(), options.view);
    }
  }
  return true;
}

function parseJsonCreator(reviver, options, obj) {
  if (obj) {
    const jsonTypeInfo = parseJsonTypeInfo(options, obj);
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
        args.push(parsePrepareMethodArg(reviver, options, obj, mappedKey));
      else if (Object.hasOwnProperty.call(obj, key))
        args.push(parsePrepareMethodArg(reviver, options, obj, key));
      else if (argIndex < objValues.length)
        args.push(objValues[argIndex]);
      else
        args.push(null)
      argIndex++;
    }
    
    let instance = (jsonCreator.constructor) ? new (method as ObjectConstructor)(...args) : (method as Function)(...args);
    
    // copy remaining properties and ignore the ones that are not part of "instance"
    let keys = Object.keys(obj).filter(n => !argNames.includes(n));
    for (let key of keys)
      if (Object.hasOwnProperty.call(instance, key)) // on TypeScript, set "useDefineForClassFields" option to true on the tsconfig.json file
        instance[key] = obj[key];

    // if there is a reference, convert the reference property to the corresponding Class
    for (let key in instance) {
      if (Object.hasOwnProperty.call(instance, key)) {
        parseJsonManagedReference(instance, reviver, options, obj, key);
        //parseJsonBackReference(instance, reviver, options, obj, key);
      }
    }
    
    return instance;
  }
}

function parseJsonRawValue(options, replacement, key) {
  const jsonRawValue = Reflect.hasMetadata("jackson:JsonRawValue", options.mainCreator, key);
  if (jsonRawValue) {
    replacement[key] = JSON.stringify(replacement[key]);
    return true;
  }
  return false;
}

function parseJsonRootName(replacement, reviver, options) {
  const jsonRootName: string = Reflect.getMetadata("jackson:JsonRootName", options.mainCreator);
  if (jsonRootName)
    return replacement[jsonRootName];
  return replacement;
}

function parsePrepareMethodArg(reviver, options, obj, key) {
  const jsonManagedReference: JsonManagedReferenceOptions = Reflect.getMetadata("jackson:JsonManagedReference", options.mainCreator, key);
  const jsonBackReference: JsonBackReferenceOptions = Reflect.getMetadata("jackson:JsonBackReference", options.mainCreator, key);
  const jsonReference = (jsonManagedReference && jsonManagedReference.class()) ? jsonManagedReference.class() : ( (jsonBackReference && jsonBackReference.class()) ? jsonBackReference.class() : null);

  if (jsonReference) {
    let referenceCreator = options.mainCreator;
    for(let constr of options.otherCreators) {
      if (isSameConstructor(jsonReference, constr)) {
        referenceCreator = constr;
        break;
      }
    }
    
    let newOptions = Object.assign(Object.create(options));
    newOptions.mainCreator = referenceCreator;
    return deepParse(key, obj[key], reviver, newOptions);
  }
  return obj[key];
}

function parseJsonReferences(replacement, reviver, options, obj, key) {
  const jsonManagedReference: JsonManagedReferenceOptions = Reflect.getMetadata("jackson:JsonManagedReference", replacement.constructor, key);
  const jsonBackReference: JsonBackReferenceOptions = Reflect.getMetadata("jackson:JsonBackReference", replacement.constructor, key);
  const jsonReference = (jsonManagedReference && jsonManagedReference.class()) ? jsonManagedReference.class() : ( (jsonBackReference && jsonBackReference.class()) ? jsonBackReference.class() : null);
  let referenceConstructor = {};

  if (jsonReference && replacement[key]) {
    if (replacement[key] instanceof Array && replacement[key].length > 0 && replacement[key][0]) {
      if (!isSameConstructor(jsonReference, replacement[key][0].constructor) && !isExtensionOf(jsonReference, replacement[key][0].constructor)) {
        replacement[key] = parsePrepareMethodArg(reviver, options, obj, key);
      }
      referenceConstructor = replacement[key][0].constructor;
    }
    else if (replacement[key] instanceof Array && replacement[key].length === 0)
      referenceConstructor = {};
    else {
      if (!isSameConstructor(jsonReference, replacement[key].constructor) && !isExtensionOf(jsonReference, replacement[key].constructor)) {
        replacement[key] = parsePrepareMethodArg(reviver, options, obj, key);
      }
      referenceConstructor = replacement[key].constructor;
    }
  }

  return referenceConstructor;
}

function parseJsonManagedReference(replacement, reviver, options, obj, key) {
  const jsonManagedReference: JsonManagedReferenceOptions = Reflect.getMetadata("jackson:JsonManagedReference", replacement.constructor, key);
  if (jsonManagedReference) {
    
    let referenceConstructor = parseJsonReferences(replacement, reviver, options, obj, key);

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

function parseJsonBackReference(replacement, reviver, options, obj, key) {
  const jsonBackReference: JsonBackReferenceOptions = Reflect.getMetadata("jackson:JsonBackReference", replacement.constructor, key);
  if (jsonBackReference) {
    
    let referenceConstructor = parseJsonReferences(replacement, reviver, options, obj, key);
    if (isSameConstructor(jsonBackReference.class(), referenceConstructor)) {
      const metadataKeys = Reflect.getMetadataKeys(referenceConstructor);
      for(let k of metadataKeys) {
        if (k.startsWith("jackson:JsonManagedReference:")) {
          let propertyKey = k.replace("jackson:JsonManagedReference:", '');
          let metadata: JsonManagedReferenceOptions = Reflect.getMetadata(k, referenceConstructor);
          if (isSameConstructor(metadata.class(), replacement.constructor)) {
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

function parseJsonAnySetter(replacement, value, key) {
  const jsonAnySetter: string = Reflect.getMetadata("jackson:JsonAnySetter", replacement);
  let jsonProperty: JsonPropertyOptions = Reflect.getMetadata("jackson:JsonProperty", replacement, key);
  if (!jsonProperty && jsonAnySetter && replacement[jsonAnySetter]) {
    if (typeof replacement[jsonAnySetter] === "function")
      replacement[jsonAnySetter](key, value[key]);
    else
      replacement[jsonAnySetter][key] = value[key];
  }
}

function parseJsonDeserialize(options, replacement, key) {
  const jsonDeserialize: (...args) => any = Reflect.getMetadata("jackson:JsonDeserialize", options.mainCreator, key);
  if (jsonDeserialize) {
    replacement[key] = jsonDeserialize(replacement[key]);
    return true;
  }
  return false;
}

function parseHasJsonIgnore(options, key) {
  let hasJsonIgnore = Reflect.hasMetadata("jackson:JsonIgnore", options.mainCreator, key);
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
  return hasJsonIgnore;
}

function parseJsonIgnoreType(options) {
  return Reflect.hasMetadata("jackson:JsonIgnoreType", options.mainCreator);
}

function parseJsonTypeInfo(options, obj) {
  const jsonTypeInfo: JsonTypeInfoOptions = Reflect.getMetadata("jackson:JsonTypeInfo", options.mainCreator);
  
  if (jsonTypeInfo) {
    let jsonTypeCtor: ObjectConstructor;
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
          jsonTypeCtor = subType.class() as ObjectConstructor;
        } else {
          const ctor: ObjectConstructor = Reflect.getMetadata("jackson:JsonTypeName:" + jsonTypeInfoProperty, subType.class());
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

function parseHasJsonView(options, key) {
  if (options.view) {
    const jsonView: JsonViewOptions = Reflect.getMetadata("jackson:JsonView", options.mainCreator, key);
    if (jsonView) {
      return isSameConstructor(jsonView.value(), options.view) || isExtensionOf(jsonView.value(), options.view);
    }
  }
  return true;
}