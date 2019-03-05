import "reflect-metadata";
import { getArgumentNames, cloneClassInstance } from './util';

export function stringify(obj, replacer, format) {
  return JSON.stringify(obj, (key, value=null) => {
    if (value && typeof value === 'object' && !(value instanceof Array)) {
      let replacement;
      let jsonValue = stringifyJsonValue(value);
      if (jsonValue)
        replacement = jsonValue;

      if (!replacement) {
        replacement = {};
        // let jsonAnyGetter = stringifyJsonAnyGetter(value);
        // if (jsonAnyGetter)
        //   replacement = jsonAnyGetter;
        let keys = stringifyJsonPropertyOrder(value);
        for (let k of keys) {
          if (!stringifyHasJsonIgnore(value, k) && Object.hasOwnProperty.call(value, k)) {
            replacement[k] = value[k];
            stringifyJsonSerialize(replacement, value, k);
            stringifyJsonRawValue(replacement, value, k);
            stringifyJsonProperty(replacement, value, k);
            stringifyJsonManagedReference(replacement, value, k);
            stringifyJsonBackReference(replacement, value, k);
            stringifyJsonAnyGetter(replacement, value, k);
          }
        }
      }

      replacement = stringifyJsonRootName(replacement, value);
      return (replacer) ? replacer(key, replacement) : replacement;
    }
    
    return (replacer) ? replacer(key, value) : value;
  }, format);
}

export function parse(text, reviver, options) {
  options.otherCreators = (options.otherCreators) ? options.otherCreators : [];
  let value = JSON.parse(text);
  return deepParse('', value, reviver, options)
}

function deepParse(key, value, reviver, options) {
  if (value && typeof value === 'object' && !(value instanceof Array)) {
    let replacement = value;
    replacement = parseJsonRootName(replacement, reviver, options);

    // convert JsonProperty to Class properties
    const creatorMetadataKeys = Reflect.getMetadataKeys(options.mainCreator);
    for(const metadataKey of creatorMetadataKeys) {
      if (metadataKey.startsWith("jackson:JsonProperty:")) {
        const metadata = Reflect.getMetadata(metadataKey, options.mainCreator);
        const realKey = metadataKey.replace("jackson:JsonProperty:", "");
        if (Object.hasOwnProperty.call(replacement, metadata.value)) {
          replacement[realKey] = replacement[metadata.value];
          delete replacement[metadata.value];
        }
      }
    }
    
    for (let k in replacement) {
      if (Object.hasOwnProperty.call(replacement, k)) {
        if (parseHasJsonIgnore(options, k)) {
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
    let arr = [];
    for(let obj of value)
      arr.push(deepParse(key, obj, reviver, options));
    return (reviver) ? reviver(key, arr) : arr;
  }
  return (reviver) ? reviver(key, value) : value;
}

function stringifyJsonAnyGetter(replacement, obj, key) {
  const jsonAnyGetter = Reflect.getMetadata("jackson:JsonAnyGetter", obj);
  let jsonProperty = Reflect.getMetadata("jackson:JsonProperty", obj, key);
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
  const jsonPropertyOrder = Reflect.getMetadata("jackson:JsonPropertyOrder", obj.constructor);
  if (jsonPropertyOrder) {
    if (jsonPropertyOrder.alphabetic)
      keys = keys.sort();
    else if (jsonPropertyOrder.value)
      keys = jsonPropertyOrder.value.concat(keys.filter(item => !jsonPropertyOrder.value.includes(item)))
  }
  return keys;
}

function stringifyJsonProperty(replacement, obj, key) {
  const jsonProperty = Reflect.getMetadata("jackson:JsonProperty", obj, key);
  if (jsonProperty) {
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
  const jsonValue = Reflect.getMetadata("jackson:JsonValue", obj);
  if (jsonValue) 
    return obj[jsonValue]();
}

function stringifyJsonRootName(replacement, obj) {
  const jsonRootName = Reflect.getMetadata("jackson:JsonRootName", obj.constructor);
  if (jsonRootName) {
    let newReplacement = {};
    newReplacement[jsonRootName] = replacement;
    return newReplacement;
  }
  return replacement;
}

function stringifyJsonSerialize(replacement, obj, key) {
  const jsonSerialize = Reflect.getMetadata("jackson:JsonSerialize", obj, key);
  if (jsonSerialize) {
    replacement[key] = jsonSerialize(replacement[key]);
    return true;
  }
  return false;
}

function stringifyHasJsonIgnore(obj, key) {
  return Reflect.hasMetadata("jackson:JsonIgnore", obj.constructor, key);
}

function stringifyJsonManagedReference(replacement, obj, key) {
  const jsonManagedReference = Reflect.getMetadata("jackson:JsonManagedReference", obj.constructor, key);
  if (jsonManagedReference) {

    let referenceConstructor;
    if (replacement[key]) {
      if (replacement[key] instanceof Array && replacement[key].length > 0)
        referenceConstructor = replacement[key][0].constructor;
      else if (replacement[key] instanceof Array && replacement[key].length == 0)
        referenceConstructor = {};
      else
      referenceConstructor = replacement[key].constructor;
    }
    else
      referenceConstructor = {};

    if (jsonManagedReference === referenceConstructor.name) {
      const metadataKeys = Reflect.getMetadataKeys(referenceConstructor);
      for(let k of metadataKeys) {
        if (k.startsWith("jackson:JsonBackReference:")) {
          let propertyKey = k.replace("jackson:JsonBackReference:", '');
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
          break;
        }
      }
    }
    
  }
}

function stringifyJsonBackReference(replacement, obj, key) {
  const jsonBackReference = Reflect.getMetadata("jackson:JsonBackReference", obj.constructor, key);
  if (jsonBackReference) {
    
    let referenceConstructor;
    if (replacement[key]) {
      if (replacement[key] instanceof Array && replacement[key].length > 0)
        referenceConstructor = replacement[key][0].constructor;
      else if (replacement[key] instanceof Array && replacement[key].length == 0)
        referenceConstructor = {};
      else
      referenceConstructor = replacement[key].constructor;
    }
    else
      referenceConstructor = {};
      
    if (jsonBackReference === referenceConstructor.name) {
      const metadataKeys = Reflect.getMetadataKeys(referenceConstructor);
      for(let k of metadataKeys) {
        if (k.startsWith("jackson:JsonManagedReference:")) {
          let propertyKey = k.replace("jackson:JsonManagedReference:", '');
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
          break;
        }
      }
    }
  }
}

function parseJsonCreator(reviver, options, obj) {
  if (obj) {
    const hasJsonCreator = Reflect.hasMetadata("jackson:JsonCreator", options.mainCreator);

    const jsonCreator = (hasJsonCreator) ? Reflect.getMetadata("jackson:JsonCreator", options.mainCreator) : options.mainCreator;

    const method = (hasJsonCreator) ? ((jsonCreator.constructor) ? jsonCreator.constructor : jsonCreator.method) : jsonCreator;

    let args = [];
    let argNames = getArgumentNames(method, !!jsonCreator.constructor);
    
    if (jsonCreator.properties) {
      for (let key in jsonCreator.properties) {
        const index = argNames.indexOf(key)
        if (index >= 0)
          argNames[index] = jsonCreator.properties[key];
      }
    }

    const creatorMetadataKeys = Reflect.getMetadataKeys(options.mainCreator);
    for(const metadataKey of creatorMetadataKeys) {
      if (metadataKey.startsWith("jackson:JsonProperty:")) {
        let key = metadataKey.replace("jackson:JsonProperty:", "")
        // jsonCreator.properties takes precedence
        if (jsonCreator.properties && Object.hasOwnProperty.call(jsonCreator.properties, key))
          continue;

        const metadata = Reflect.getMetadata(metadataKey, options.mainCreator);
        const index = argNames.indexOf(key);
        if (index >= 0) 
          argNames[index] = metadata.value
      }
    }
    
    for (let key of argNames) {
      if (Object.hasOwnProperty.call(obj, key))
        args.push(parsePrepareMethodArg(reviver, options, obj, key));
      else
        args.push(null);
    }
    
    let instance = (jsonCreator.constructor) ? new method(...args) : method(...args);

    // copy remaining properties
    let keys = Object.keys(obj).filter(n => !argNames.includes(n));
    for (let key of keys)
      if (Object.hasOwnProperty.call(instance, key))
        instance[key] = obj[key];

    // if there is a reference, convert the reference property to the corresponding Class
    for (let key in instance) {
      if (Object.hasOwnProperty.call(instance, key)) {
        parseJsonManagedReference(instance, reviver, options, obj, key);
        parseJsonBackReference(instance, reviver, options, obj, key);
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
  const jsonRootName = Reflect.getMetadata("jackson:JsonRootName", options.mainCreator);
  if (jsonRootName)
    return replacement[jsonRootName];
  return replacement;
}

function parsePrepareMethodArg(reviver, options, obj, key) {
  const jsonManagedReference = Reflect.getMetadata("jackson:JsonManagedReference", options.mainCreator, key);
  const jsonBackReference = Reflect.getMetadata("jackson:JsonBackReference", options.mainCreator, key);
  const jsonReference = jsonManagedReference || jsonBackReference;
  
  if (jsonReference) {
    let referenceCreator = options.mainCreator;
    for(let constr of options.otherCreators) {
      if (constr.name === jsonReference) {
        referenceCreator = constr;
        break;
      }
    }

    let newOptions = Object.assign(options);
    newOptions.mainCreator = referenceCreator;

    return deepParse(key, obj[key], reviver, options);
  }
  return obj[key];
}

function parseJsonManagedReference(replacement, reviver, options, obj, key) {
  const jsonManagedReference = Reflect.getMetadata("jackson:JsonManagedReference", replacement.constructor, key);
  if (jsonManagedReference) {
    
    if (replacement[key] && jsonManagedReference !== replacement[key].constructor.name)
      replacement[key] = parsePrepareMethodArg(reviver, options, obj, key);
    
    let referenceConstructor;
    if (replacement[key]) {
      if (replacement[key] instanceof Array && replacement[key].length > 0)
        referenceConstructor = replacement[key][0].constructor;
      else if (replacement[key] instanceof Array && replacement[key].length == 0)
        referenceConstructor = {};
      else
      referenceConstructor = replacement[key].constructor;
    }
    else
      referenceConstructor = {};
    
    if (jsonManagedReference === referenceConstructor.name) {
      const metadataKeys = Reflect.getMetadataKeys(referenceConstructor);
      for(let k of metadataKeys) {
        if (k.startsWith("jackson:JsonBackReference:")) {
          let propertyKey = k.replace("jackson:JsonBackReference:", '');
          
          if (replacement[key] instanceof Array)
            for(let index in replacement[key])
              replacement[key][index][propertyKey] = replacement;
          else
            replacement[key][propertyKey] = replacement;

          break;
        }
      }
    }
  }
}

function parseJsonBackReference(replacement, reviver, options, obj, key) {
  const jsonBackReference = Reflect.getMetadata("jackson:JsonBackReference", replacement.constructor, key);
  if (jsonBackReference) {
    
    if (replacement[key] && jsonBackReference !== replacement[key].constructor.name)
      replacement[key] = parsePrepareMethodArg(reviver, options, obj, key);
    
    let referenceConstructor;
    if (replacement[key]) {
      if (replacement[key] instanceof Array && replacement[key].length > 0)
        referenceConstructor = replacement[key][0].constructor;
      else if (replacement[key] instanceof Array && replacement[key].length == 0)
        referenceConstructor = {};
      else
      referenceConstructor = replacement[key].constructor;
    }
    else
      referenceConstructor = {};

    if (jsonBackReference === referenceConstructor.name) {
      const metadataKeys = Reflect.getMetadataKeys(referenceConstructor);
      for(let k of metadataKeys) {
        if (k.startsWith("jackson:JsonManagedReference:")) {
          let propertyKey = k.replace("jackson:JsonManagedReference:", '');

          if (replacement[key] instanceof Array)
            for(let index in replacement[key])
              replacement[key][index][propertyKey] = replacement;
          else
            replacement[key][propertyKey] = replacement;
            
          break;
        }
      }
    }
  }
}

function parseJsonAnySetter(replacement, value, key) {
  const jsonAnySetter = Reflect.getMetadata("jackson:JsonAnySetter", replacement);
  let jsonProperty = Reflect.getMetadata("jackson:JsonProperty", replacement, key);
  if (!jsonProperty && jsonAnySetter && replacement[jsonAnySetter]) {
    if (typeof replacement[jsonAnySetter] === "function")
      replacement[jsonAnySetter](key, value[key]);
    else
      replacement[jsonAnySetter][key] = value[key];
  }
}

function parseJsonDeserialize(options, replacement, key) {
  const jsonDeserialize = Reflect.getMetadata("jackson:JsonDeserialize", options.mainCreator, key);
  if (jsonDeserialize) {
    replacement[key] = jsonDeserialize(replacement[key]);
    return true;
  }
  return false;
}

function parseHasJsonIgnore(options, key) {
  return Reflect.hasMetadata("jackson:JsonIgnore", options.mainCreator, key);
}