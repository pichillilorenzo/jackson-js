import {
  JsonClassOptions, JsonFilterOptions,
  JsonFormatOptions, JsonIdentityInfoOptions,
  JsonIgnorePropertiesOptions,
  JsonIncludeOptions,
  JsonPropertyOptions,
  JsonPropertyOrderOptions, JsonSerializeOptions, JsonStringifierFilterOptions,
  JsonStringifierOptions, JsonStringifierTransformerOptions,
  JsonSubTypeOptions,
  JsonTypeInfoOptions,
  JsonUnwrappedOptions,
  JsonViewOptions
} from '../@types';
import {JsonPropertyAccess} from '../annotations/JsonProperty';
import {JsonIncludeType} from '../annotations/JsonInclude';
import {
  cloneClassInstance,
  isIterableNoMapNoString,
  isObjLiteral,
  isSameConstructor, isSameConstructorOrExtensionOf,
  isSameConstructorOrExtensionOfNoObject
} from '../util';
import {JsonTypeInfoAs, JsonTypeInfoId} from '../annotations/JsonTypeInfo';
import {JsonFormatShape} from '../annotations/JsonFormat';
import {SerializationFeature} from '../databind/SerializationFeature';
import {ObjectIdGenerator} from '../annotations/JsonIdentityInfo';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { v4 as uuidv4, v1 as uuidv1, v5 as uuidv5, v3 as uuidv3 } from 'uuid';
import {JacksonError} from './JacksonError';
import {JsonAnyGetterPrivateOptions} from '../@types/private';
import {JsonFilterType} from '..';

dayjs.extend(customParseFormat);

/**
 *
 */
export class JsonStringifier<T> {

  /**
   * WeakMap used to track all objects about @JsonIdentityInfo()
   */
  private _globalValueAlreadySeen = new WeakMap();

  /**
   *
   */
  private _intSequenceGenerator = 0;

  /**
   *
   */
  constructor() {
  }

  /**
   *
   * @param obj
   * @param options
   */
  stringify(obj: T, options: JsonStringifierOptions = {}): string {
    const newOptions: JsonStringifierTransformerOptions = {
      mainCreator: [(obj != null) ? (obj.constructor as ObjectConstructor) : Object],
      ...options
    };
    const preProcessedObj = this.transform('', obj, newOptions, new Map());
    return JSON.stringify(preProcessedObj, null, newOptions.format);
  }

  /**
   *
   * @param key
   * @param value
   * @param options
   * @param valueAlreadySeen: Map used to manage object circular references
   */
  transform(key: string, value: any, options: JsonStringifierTransformerOptions, valueAlreadySeen: Map<any, any>): any {

    if (typeof value === 'number' && isNaN(value) && options.features[SerializationFeature.WRITE_NAN_AS_ZERO]) {
      value = 0;
    } else if (value === Infinity) {
      if (options.features[SerializationFeature.WRITE_POSITIVE_INFINITY_AS_NUMBER_MAX_SAFE_INTEGER]) {
        value = Number.MAX_SAFE_INTEGER;
      } else if (options.features[SerializationFeature.WRITE_POSITIVE_INFINITY_AS_NUMBER_MAX_VALUE]) {
        value = Number.MAX_VALUE;
      }
    } else if (value === -Infinity) {
      if (options.features[SerializationFeature.WRITE_NEGATIVE_INFINITY_AS_NUMBER_MIN_SAFE_INTEGER]) {
        value = Number.MIN_SAFE_INTEGER;
      } else if (options.features[SerializationFeature.WRITE_NEGATIVE_INFINITY_AS_NUMBER_MIN_VALUE]) {
        value = Number.MIN_VALUE;
      }
    } else if (value != null && isSameConstructorOrExtensionOfNoObject(value.constructor, Date) &&
      options.features[SerializationFeature.WRITE_DATES_AS_TIMESTAMPS]) {
      value = value.getTime();
    }

    value = this.invokeCustomSerializers(key, value, options);

    if (value != null) {

      const identity = this._globalValueAlreadySeen.get(value);
      if (identity) {
        return identity;
      }

      if (isSameConstructorOrExtensionOfNoObject(value.constructor, Map)) {
        value = this.stringifyMap(value);
      }

      if (BigInt && isSameConstructorOrExtensionOfNoObject(value.constructor, BigInt)) {
        return value.toString() + 'n';
      } else if (isSameConstructorOrExtensionOfNoObject(value.constructor, RegExp)) {
        const replacement = value.toString();
        return replacement.substring(1, replacement.length - 1);
      } else if (isSameConstructorOrExtensionOfNoObject(value.constructor, Date)) {
        return value;
      } else if (typeof value === 'object' && !isIterableNoMapNoString(value)) {

        if (this.stringifyJsonIgnoreType(value)) {
          return null;
        }

        if (valueAlreadySeen.has(value)) {
          throw new JacksonError(`Infinite recursion on key "${key}" of type "${value.constructor.name}"`);
        }
        valueAlreadySeen.set(value, (identity) ? identity : null);

        let replacement;
        const jsonValue = this.stringifyJsonValue(value);
        if (jsonValue) {
          replacement = jsonValue;
        }

        if (!replacement) {
          replacement = {};

          let keys = Object.keys(value);
          keys = this.stringifyJsonAnyGetter(replacement, value, keys);
          if (options.features[SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS]) {
            keys = keys.sort();
          }
          const hasJsonPropertyOrder = Reflect.hasMetadata('jackson:JsonPropertyOrder', value.constructor);
          if (hasJsonPropertyOrder) {
            keys = this.stringifyJsonPropertyOrder(value);
          }
          for (const k of keys) {
            if (!this.stringifyHasJsonIgnore(value, k) &&
              !this.stringifyJsonInclude(value, k) &&
              this.stringifyHasJsonView(value, k, options) &&
              !this.stringifyHasJsonBackReference(value, k) &&
              !this.stringifyIsPropertyKeyExcludedByJsonFilter(value, k, options) &&
              Object.hasOwnProperty.call(value, k)) {

              if (value === value[k] && options.features[SerializationFeature.FAIL_ON_SELF_REFERENCES]) {
                // eslint-disable-next-line max-len
                throw new JacksonError(`Direct self-reference leading to cycle (through reference chain: ${value.constructor.name}["${k}"])`);
              }

              replacement[k] = value[k];
              if (replacement[k] != null) {
                this.stringifyJsonFormat(replacement, value, k);
                this.stringifyJsonSerialize(replacement, value, k);
                this.stringifyJsonRawValue(replacement, value, k);
                this.stringifyJsonFilter(replacement, value, k, options);
                this.stringifyJsonProperty(replacement, value, k);
                this.stringifyJsonUnwrapped(replacement, value, k, options);
              }
            }
          }
        }

        this.stringifyJsonIdentityInfo(replacement, value, key);

        replacement = this.stringifyJsonTypeInfo(replacement, value);
        replacement = this.stringifyJsonRootName(replacement, value);

        // eslint-disable-next-line guard-for-in
        for (const k in replacement) {
          const newOptions = {...options};
          let newMainCreator;
          const jsonClass: JsonClassOptions = Reflect.getMetadata('jackson:JsonClass', value.constructor, k);
          if (jsonClass && jsonClass.class) {
            newMainCreator = jsonClass.class();
          } else if (replacement[k] != null) {
            newMainCreator = [replacement[k].constructor];
          } else {
            newMainCreator = [Object];
          }
          newOptions.mainCreator = newMainCreator;
          replacement[k] = this.transform(k, replacement[k], newOptions, new Map(valueAlreadySeen));
        }

        return replacement;
      } else if (isIterableNoMapNoString(value)) {
        const replacement = this.stringifyIterable(key, value, options, valueAlreadySeen);
        return replacement;
      }
    }

    return value;
  }

  private invokeCustomSerializers(key: string, value: any, options: JsonStringifierTransformerOptions): any {
    if (options.serializers) {
      const currentMainCreator = options.mainCreator[0];
      for (const serializer of options.serializers) {
        if (serializer.type != null) {
          const classType = serializer.type();
          if (
            (value != null && typeof classType === 'string' && classType !== typeof value) ||
            (typeof classType !== 'string' && currentMainCreator != null && !isSameConstructor(classType, currentMainCreator))
          ) {
            continue;
          }
        }
        value = serializer.mapper(key, value);
      }
    }
    return value;
  }

  private stringifyJsonAnyGetter(replacement: any, obj: any, oldKeys: string[]): string[] {
    const newKeys = [];
    const jsonAnyGetter: JsonAnyGetterPrivateOptions = Reflect.getMetadata('jackson:JsonAnyGetter', obj);
    if (jsonAnyGetter && obj[jsonAnyGetter.propertyKey]) {
      const map = (typeof obj[jsonAnyGetter.propertyKey] === 'function') ?
        obj[jsonAnyGetter.propertyKey]() :
        obj[jsonAnyGetter.propertyKey];

      if (!(map instanceof Map) && !isObjLiteral(map)) {
        // eslint-disable-next-line max-len
        throw new JacksonError(`Property ${obj.constructor.name}["${jsonAnyGetter.propertyKey}"] annotated with @JsonAnyGetter() returned a "${map.constructor.name}": expected "Map" or "Object Literal".`);
      }
      if (map instanceof Map) {
        for (const [k, value] of map) {
          replacement[k] = value;
          newKeys.push(k);
        }
      } else {
        for (const k in map) {
          if (Object.hasOwnProperty.call(map, k)) {
            replacement[k] = map[k];
            newKeys.push(k);
          }
        }
      }

      if (jsonAnyGetter.for && oldKeys.includes(jsonAnyGetter.for) &&
        !Reflect.hasMetadata('jackson:JsonProperty', obj, jsonAnyGetter.for)) {
        oldKeys.splice(oldKeys.indexOf(jsonAnyGetter.for), 1);
      } else {
        oldKeys = [];
      }
    }
    return [...new Set([...oldKeys, ...newKeys])];
  }

  private stringifyJsonPropertyOrder(obj: any): string[] {
    let keys = Object.keys(obj);
    const jsonPropertyOrder: JsonPropertyOrderOptions = Reflect.getMetadata('jackson:JsonPropertyOrder', obj.constructor);
    if (jsonPropertyOrder) {
      if (jsonPropertyOrder.alphabetic) {
        keys = keys.sort();
      } else if (jsonPropertyOrder.value) {
        keys = jsonPropertyOrder.value.concat(keys.filter(item => !jsonPropertyOrder.value.includes(item)));
      }
    }
    return keys;
  }

  private stringifyJsonProperty(replacement: any, obj: any, key: string): void {
    const jsonProperty: JsonPropertyOptions = Reflect.getMetadata('jackson:JsonProperty', obj, key);
    const hasJsonIgnore = Reflect.hasMetadata('jackson:JsonIgnore', obj.constructor, key);
    if (jsonProperty) {
      const isIgnored = jsonProperty.access === JsonPropertyAccess.WRITE_ONLY ||
        (jsonProperty.access === JsonPropertyAccess.AUTO && hasJsonIgnore);
      if (!isIgnored && jsonProperty.value !== key) {
        replacement[jsonProperty.value] = replacement[key];
        delete replacement[key];
      } else if (isIgnored) {
        delete replacement[key];
      }
    }
  }

  private stringifyJsonRawValue(replacement: any, obj: any, key: string): void {
    const jsonRawValue = Reflect.hasMetadata('jackson:JsonRawValue', obj.constructor, key);
    if (jsonRawValue) {
      replacement[key] = JSON.parse(replacement[key]);
    }
  }

  private stringifyJsonValue(obj: any): null | any  {
    const jsonValue: string = Reflect.getMetadata('jackson:JsonValue', obj);
    if (jsonValue) {
      return (typeof obj[jsonValue] === 'function') ? obj[jsonValue]() : obj[jsonValue];
    }
  }

  private stringifyJsonRootName(replacement: any, obj: any): any {
    const jsonRootName: string = Reflect.getMetadata('jackson:JsonRootName', obj.constructor);
    if (jsonRootName) {
      const newReplacement = {};
      newReplacement[jsonRootName] = replacement;
      return newReplacement;
    }
    return replacement;
  }

  private stringifyJsonSerialize(replacement: any, obj: any, key: string): void {
    const jsonSerialize: JsonSerializeOptions = Reflect.getMetadata('jackson:JsonSerialize', obj, key);
    if (jsonSerialize && jsonSerialize.using) {
      replacement[key] = jsonSerialize.using(replacement[key]);
    }
  }

  private stringifyHasJsonIgnore(obj: any, key: string): boolean {
    const hasJsonIgnore = Reflect.hasMetadata('jackson:JsonIgnore', obj.constructor, key);
    const hasJsonProperty = Reflect.hasMetadata('jackson:JsonProperty', obj, key);

    if (!hasJsonIgnore) {
      const jsonIgnoreProperties: JsonIgnorePropertiesOptions = Reflect.getMetadata('jackson:JsonIgnoreProperties', obj.constructor);
      if (jsonIgnoreProperties && !jsonIgnoreProperties.allowGetters) {
        if (jsonIgnoreProperties.value.includes(key)) {return true; }
        const jsonProperty: JsonPropertyOptions = Reflect.getMetadata('jackson:JsonProperty', obj, key);
        if (jsonProperty && jsonIgnoreProperties.value.includes(jsonProperty.value)) {return true; }
      }
    }

    return hasJsonIgnore && !hasJsonProperty;
  }

  private stringifyJsonInclude(obj: any, key: string): boolean {
    const keyJsonInclude: JsonIncludeOptions = Reflect.getMetadata('jackson:JsonInclude', obj, key);
    const constructorJsonInclude: JsonIncludeOptions = Reflect.getMetadata('jackson:JsonInclude', obj.constructor);
    const jsonInclude = (keyJsonInclude) ? keyJsonInclude : constructorJsonInclude;

    if (jsonInclude && jsonInclude.value >= JsonIncludeType.ALWAYS) {
      const value = obj[key];
      switch (jsonInclude.value) {
      case JsonIncludeType.NON_EMPTY:
        return value == null || ((typeof value === 'object' || typeof value === 'string') && Object.keys(value).length === 0);
      case JsonIncludeType.NON_NULL:
        return value == null;
      }
    }

    return false;
  }

  private stringifyJsonIgnoreType(obj: any): boolean {
    return Reflect.hasMetadata('jackson:JsonIgnoreType', obj.constructor);
  }

  private stringifyHasJsonBackReference(obj: any, key: string): boolean {
    return Reflect.hasMetadata('jackson:JsonBackReference', obj.constructor, key);
  }

  private stringifyJsonTypeInfo(replacement: any, obj: any): any {
    const jsonTypeInfo: JsonTypeInfoOptions = Reflect.getMetadata('jackson:JsonTypeInfo', obj.constructor);
    if (jsonTypeInfo) {
      let jsonTypeName: string;

      const jsonSubTypes: JsonSubTypeOptions[] = Reflect.getMetadata('jackson:JsonSubTypes', obj.constructor);
      if (jsonSubTypes) {
        for (const subType of jsonSubTypes) {
          if (subType.name && isSameConstructor(subType.class(), obj.constructor)) {
            jsonTypeName = subType.name;
            break;
          }
        }
      }

      if (!jsonTypeName) {
        jsonTypeName = Reflect.getMetadata('jackson:JsonTypeName', obj.constructor);
      }

      switch (jsonTypeInfo.use) {
      case JsonTypeInfoId.NAME:
        jsonTypeName = obj.constructor.name;
        break;
      }

      let newReplacement: any;
      switch (jsonTypeInfo.include) {
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

  private stringifyJsonFormat(replacement: any, obj: any, key: string): void {
    const jsonFormat: JsonFormatOptions = Reflect.getMetadata('jackson:JsonFormat', obj, key);

    if (jsonFormat) {
      switch (jsonFormat.shape) {
      case JsonFormatShape.ARRAY:
        if (typeof replacement[key] === 'object') {
          replacement[key] = Object.values(replacement[key]);
        } else {
          replacement[key] = [replacement[key]];
        }
        break;
      case JsonFormatShape.BOOLEAN:
        replacement[key] = !!replacement[key];
        break;
      case JsonFormatShape.NUMBER_FLOAT:
        if (replacement[key] instanceof Date) {
          replacement[key] = parseFloat(replacement[key].getTime());
        } else {
          replacement[key] = parseFloat(replacement[key]);
        }
        break;
      case JsonFormatShape.NUMBER_INT:
        if (replacement[key] instanceof Date) {
          replacement[key] = replacement[key].getTime();
        } else {
          replacement[key] = parseInt(replacement[key], 10);
        }
        break;
      case JsonFormatShape.OBJECT:
        replacement[key] = Object.assign(Object.create(replacement[key]), replacement[key]);
        break;
      case JsonFormatShape.SCALAR:
        if (typeof replacement[key] === 'object') {
          replacement[key] = null;
        }
        break;
      case JsonFormatShape.STRING:
        if (replacement[key] instanceof Date) {
          const locale = jsonFormat.locale;
          require('dayjs/locale/' + locale);
          const timezone = (jsonFormat.timezone) ? { timeZone: jsonFormat.timezone } : {};
          replacement[key] = dayjs(replacement[key].toLocaleString('en-US', timezone)).locale(locale).format(jsonFormat.pattern);
        } else {
          replacement[key] = replacement[key].toString();
        }
        break;
      }
    }
  }

  private stringifyHasJsonView(obj: any, key: string, options: JsonStringifierTransformerOptions): boolean {
    if (options.withView) {
      const jsonView: JsonViewOptions = Reflect.getMetadata('jackson:JsonView', obj.constructor, key);
      if (jsonView) {
        const views = jsonView.value();
        for (const view of views) {
          if (isSameConstructorOrExtensionOf(view, options.withView())) {
            return true;
          }
        }
        return false;
      }
    }
    return true;
  }

  private stringifyJsonUnwrapped(replacement: any, obj: any, key: string, options: JsonStringifierTransformerOptions): void {
    const jsonUnwrapped: JsonUnwrappedOptions = Reflect.getMetadata('jackson:JsonUnwrapped', obj, key);
    const hasJsonTypeInfo = (typeof obj[key] === 'object') ?
      Reflect.hasMetadata('jackson:JsonTypeInfo', obj[key].constructor) : false;

    if (jsonUnwrapped) {
      if (hasJsonTypeInfo && options.features[SerializationFeature.FAIL_ON_UNWRAPPED_TYPE_IDENTIFIERS]) {
        // eslint-disable-next-line max-len
        throw new JacksonError(`Unwrapped property requires use of type information: cannot serialize without disabling "SerializationFeature.FAIL_ON_UNWRAPPED_TYPE_IDENTIFIERS" (through reference chain: ${obj.constructor.name}["${key}"])`);
      }

      const prefix = (jsonUnwrapped.prefix != null) ? jsonUnwrapped.prefix : '';
      const suffix = (jsonUnwrapped.suffix != null) ? jsonUnwrapped.suffix : '';

      const keys = Object.keys(obj[key]);
      for (const oldKey of keys) {
        const newKey = prefix + oldKey + suffix;
        replacement[newKey] = obj[key][oldKey];
      }

      delete replacement[key];
    }
  }

  private stringifyJsonIdentityInfo(replacement: any, obj: any, key: string): void {
    const jsonIdentityInfo: JsonIdentityInfoOptions = Reflect.getMetadata('jackson:JsonIdentityInfo', obj.constructor);

    if (jsonIdentityInfo) {

      if (this._globalValueAlreadySeen.has(obj)) {
        replacement[jsonIdentityInfo.property] = this._globalValueAlreadySeen.get(obj);
      } else {
        if (typeof jsonIdentityInfo.generator === 'function') {
          replacement[jsonIdentityInfo.property] = jsonIdentityInfo.generator(obj);
        } else {
          switch (jsonIdentityInfo.generator) {
          case ObjectIdGenerator.IntSequenceGenerator:
            this._intSequenceGenerator++;
            replacement[jsonIdentityInfo.property] = this._intSequenceGenerator;
            break;
          case ObjectIdGenerator.None:
            replacement[jsonIdentityInfo.property] = null;
            break;
          case ObjectIdGenerator.PropertyGenerator:
            // Abstract place-holder class which is used to denote case where Object Identifier
            // to use comes from a Class property using "JsonIdentityInfoOptions.property"
            break;
          case ObjectIdGenerator.UUIDv5Generator:
            const uuidv5Options = jsonIdentityInfo.uuidv5;
            const uuidv5Args: any[] = [uuidv5Options.name, uuidv5Options.namespace];
            if (uuidv5Options.buffer != null) {
              uuidv5Args.push(uuidv5Options.buffer);
              if (uuidv5Options.offset != null) {
                uuidv5Args.push(uuidv5Options.offset);
              }
            }
            replacement[jsonIdentityInfo.property] = uuidv5(...uuidv5Args);
            break;
          case ObjectIdGenerator.UUIDv4Generator:
            const uuidv4Options = jsonIdentityInfo.uuidv4;
            const uuidv4Args: any[] = [uuidv4Options.options];
            if (uuidv4Options.buffer != null) {
              uuidv4Args.push(uuidv4Options.buffer);
              if (uuidv4Options.offset != null) {
                uuidv4Args.push(uuidv4Options.offset);
              }
            }
            replacement[jsonIdentityInfo.property] = uuidv4(...uuidv4Args);
            break;
          case ObjectIdGenerator.UUIDv3Generator:
            const uuidv3Options = jsonIdentityInfo.uuidv3;
            const uuidv3Args: any[] = [uuidv3Options.name, uuidv3Options.namespace];
            if (uuidv3Options.buffer != null) {
              uuidv3Args.push(uuidv3Options.buffer);
              if (uuidv3Options.offset != null) {
                uuidv3Args.push(uuidv3Options.offset);
              }
            }
            replacement[jsonIdentityInfo.property] = uuidv3(...uuidv3Args);
            break;
          case ObjectIdGenerator.UUIDv1Generator:
            const uuidv1Options = jsonIdentityInfo.uuidv1;
            const uuidv1Args: any[] = [uuidv1Options.options];
            if (uuidv1Options.buffer != null) {
              uuidv1Args.push(uuidv1Options.buffer);
              if (uuidv1Options.offset != null) {
                uuidv1Args.push(uuidv1Options.offset);
              }
            }
            replacement[jsonIdentityInfo.property] = uuidv1(...uuidv1Args);
            break;
          }
        }
      }

      if (!this._globalValueAlreadySeen.has(obj)) {
        this._globalValueAlreadySeen.set(obj, replacement[jsonIdentityInfo.property]);
      }
    }
  }

  private stringifyIterable(key: string, iterableNoString: any,
                            options: JsonStringifierTransformerOptions, valueAlreadySeen: Map<any, any>): any[] {
    const iterable = [...iterableNoString];
    const newIterable = [];
    for (const value of iterable) {
      const newOptions = {...options};
      let newMainCreator;
      if (options.mainCreator.length > 1) {
        newMainCreator = options.mainCreator[1];
      } else if (value != null) {
        newMainCreator = [value.constructor];
      } else {
        newMainCreator = [Object];
      }
      newOptions.mainCreator = newMainCreator;
      (newIterable).push(this.transform(key, value, newOptions, new Map(valueAlreadySeen)));
    }
    return newIterable;
  }

  private stringifyMap(map: Map<any, any>): any {
    const newValue = {};
    for (const [k, val] of map) {
      newValue[k.toString()] = val;
    }
    return newValue;
  }

  private isPropertyKeyExcludedByJsonFilter(filter: JsonStringifierFilterOptions,
                                            obj: any, key: string): boolean {
    if (filter.values == null) {
      return false;
    }
    const jsonProperty: JsonPropertyOptions = Reflect.getMetadata('jackson:JsonProperty', obj, key);
    switch (filter.type) {
    case JsonFilterType.FILTER_OUT_ALL_EXCEPT:
      return !filter.values.includes(key) && !(jsonProperty && filter.values.includes(jsonProperty.value));
    case JsonFilterType.SERIALIZE_ALL:
      return false;
    case JsonFilterType.SERIALIZE_ALL_EXCEPT:
      return filter.values.includes(key) || (jsonProperty && filter.values.includes(jsonProperty.value));
    }
  }

  private stringifyIsPropertyKeyExcludedByJsonFilter(obj: any, key: string, options: JsonStringifierTransformerOptions): boolean {
    const jsonFilter: JsonFilterOptions = Reflect.getMetadata('jackson:JsonFilter', obj.constructor);
    if (jsonFilter) {
      const filter = options.filters[jsonFilter.name];
      if (filter) {
        return this.isPropertyKeyExcludedByJsonFilter(filter, obj, key);
      }
    }
    return false;
  }

  private stringifyJsonFilter(replacement: any, obj: any, key: string, options: JsonStringifierTransformerOptions) {
    const jsonFilter: JsonFilterOptions = Reflect.getMetadata('jackson:JsonFilter', obj, key);
    if (jsonFilter) {
      const filter = options.filters[jsonFilter.name];
      if (filter) {
        replacement[key] = cloneClassInstance(obj[key]);
        // eslint-disable-next-line guard-for-in
        for (const propertyKey in obj[key]) {
          const isExluded = this.isPropertyKeyExcludedByJsonFilter(filter, obj[key], propertyKey);
          if (isExluded) {
            delete replacement[key][propertyKey];
          }
        }
      }
    }
  }
}
