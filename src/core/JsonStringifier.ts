import {
  JsonAppendOptions,
  JsonClassOptions, JsonFilterOptions,
  JsonFormatOptions, JsonIdentityInfoOptions, JsonIdentityReferenceOptions,
  JsonIgnorePropertiesOptions,
  JsonIncludeOptions, JsonNamingOptions,
  JsonPropertyOptions,
  JsonPropertyOrderOptions, JsonRootNameOptions, JsonSerializeOptions, JsonStringifierFilterOptions,
  JsonStringifierOptions, JsonStringifierTransformerOptions,
  JsonSubTypeOptions, JsonSubTypesOptions,
  JsonTypeInfoOptions, JsonTypeNameOptions,
  JsonUnwrappedOptions,
  JsonViewOptions
} from '../@types';
import {JsonPropertyAccess} from '../annotations/JsonProperty';
import {JsonIncludeType} from '../annotations/JsonInclude';
import {
  cloneClassInstance, getDefaultPrimitiveTypeValue, getMetadata, hasMetadata, isConstructorPrimitiveType,
  isIterableNoMapNoString,
  isObjLiteral,
  isSameConstructor, isSameConstructorOrExtensionOf, isVariablePrimitiveType
} from '../util';
import {JsonTypeInfoAs, JsonTypeInfoId} from '../annotations/JsonTypeInfo';
import {JsonFormatShape} from '../annotations/JsonFormat';
import {SerializationFeature} from '../databind/SerializationFeature';
import {ObjectIdGenerator} from '../annotations/JsonIdentityInfo';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import { v4 as uuidv4, v1 as uuidv1, v5 as uuidv5, v3 as uuidv3 } from 'uuid';
import {JacksonError} from './JacksonError';
import {JsonAnyGetterPrivateOptions, JsonTypeNamePrivateOptions, JsonValuePrivateOptions} from '../@types/private';
import {JsonFilterType} from '..';
import {JsonNamingStrategy} from '../annotations/JsonNaming';

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
      features: [],
      filters: {},
      serializers: [],
      attributes: {},
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
    options = {
      features: [],
      filters: {},
      serializers: [],
      attributes: {},
      ...options
    };

    if (options.forType && options.forType.has(value.constructor)) {
      options = {
        mainCreator: [value.constructor as ObjectConstructor],
        ...options,
        ...(options.forType.get(value.constructor))
      };
    }

    if (value == null && isConstructorPrimitiveType(options.mainCreator[0])) {
      value = this.getDefaultValue(options);
    }

    if (value != null && value.constructor === Number && isNaN(value) && options.features[SerializationFeature.WRITE_NAN_AS_ZERO]) {
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
    } else if (value != null && value instanceof Date &&
      options.features[SerializationFeature.WRITE_DATES_AS_TIMESTAMPS]) {
      value = value.getTime();
    }

    value = this.invokeCustomSerializers(key, value, options);

    if (value != null) {

      const identity = this._globalValueAlreadySeen.get(value);
      if (identity) {
        return identity;
      }

      value = this.stringifyClassJsonFormat(value, options);

      if (value instanceof Map) {
        value = this.stringifyMap(value, options);
      }

      if (BigInt && value instanceof BigInt) {
        return value.toString() + 'n';
      } else if (value instanceof RegExp) {
        const replacement = value.toString();
        return replacement.substring(1, replacement.length - 1);
      } else if (value instanceof Date) {
        return value;
      } else if (typeof value === 'object' && !isIterableNoMapNoString(value)) {

        if (this.stringifyJsonIgnoreType(value, options)) {
          return null;
        }

        if (valueAlreadySeen.has(value)) {
          throw new JacksonError(`Infinite recursion on key "${key}" of type "${value.constructor.name}"`);
        }
        valueAlreadySeen.set(value, (identity) ? identity : null);

        let replacement = {};
        const jsonValue = this.stringifyJsonValue(value, options);
        if (jsonValue) {
          replacement = jsonValue;
          return replacement;
        }

        if (this.isPrependJsonAppend(value, options)) {
          this.stringifyJsonAppend(replacement, value, options);
        }

        let keys = Object.keys(value);
        keys = this.stringifyJsonAnyGetter(replacement, value, keys, options);
        if (options.features[SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS]) {
          keys = keys.sort();
        }
        const hasJsonPropertyOrder = hasMetadata('jackson:JsonPropertyOrder', value.constructor, null, options.annotationsEnabled);
        if (hasJsonPropertyOrder) {
          keys = this.stringifyJsonPropertyOrder(value, options);
        }
        for (const k of keys) {
          if (!this.stringifyHasJsonIgnore(value, k, options) &&
            !this.stringifyJsonInclude(value, k, options) &&
            this.stringifyHasJsonView(value, k, options) &&
            !this.stringifyHasJsonBackReference(value, k, options) &&
            !this.stringifyIsPropertyKeyExcludedByJsonFilter(value, k, options) &&
            Object.hasOwnProperty.call(value, k)) {

            replacement[k] = value[k];

            // if it has a JsonIdentityReference, then we can skip all these methods because
            // the entire object will be replaced later by the identity value
            if (!this.hasJsonIdentityReferenceAlwaysAsId(value, options)) {
              if (value === value[k] && options.features[SerializationFeature.FAIL_ON_SELF_REFERENCES]) {
                // eslint-disable-next-line max-len
                throw new JacksonError(`Direct self-reference leading to cycle (through reference chain: ${value.constructor.name}["${k}"])`);
              }

              replacement[k] = value[k];
              if (replacement[k] != null) {
                replacement[k] = this.stringifyPropertyJsonFormat(replacement, value, k, options);
                this.stringifyJsonSerialize(replacement, value, k, options);
                this.stringifyJsonRawValue(replacement, value, k, options);
                this.stringifyJsonFilter(replacement, value, k, options);
                this.stringifyJsonProperty(replacement, value, k, options);
                this.stringifyJsonUnwrapped(replacement, value, k, options);
              }
            }
          }
        }

        if (!this.isPrependJsonAppend(value, options)) {
          this.stringifyJsonAppend(replacement, value, options);
        }

        this.stringifyJsonIdentityInfo(replacement, value, options);

        if (this.hasJsonIdentityReferenceAlwaysAsId(value, options)) {
          replacement = this.stringifyJsonIdentityReference(replacement, value, options);
        } else {
          replacement = this.stringifyJsonTypeInfo(replacement, value, options);
          replacement = this.stringifyJsonRootName(replacement, value, options);

          // eslint-disable-next-line guard-for-in
          for (const k in replacement) {
            const newOptions = {...options};
            let newMainCreator;
            const jsonClass: JsonClassOptions = getMetadata('jackson:JsonClass', value.constructor, k, options.annotationsEnabled);
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
        }

        this.stringifyJsonNaming(replacement, value, options);

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

  private getDefaultValue(options: JsonStringifierTransformerOptions): any | null {
    let defaultValue = null;
    const currentMainCreator = options.mainCreator[0];
    if (currentMainCreator === String &&
      (options.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        options.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_STRING_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(String);
    } else if (currentMainCreator === Number &&
      (options.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        options.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_NUMBER_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(Number);
    } else if (currentMainCreator === Boolean &&
      (options.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        options.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_BOOLEAN_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(Boolean);
    } else if (BigInt && currentMainCreator === BigInt &&
      (options.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        options.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_BIGINT_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(BigInt);
    }
    return defaultValue;
  }

  private stringifyJsonAnyGetter(replacement: any, obj: any, oldKeys: string[], options: JsonStringifierTransformerOptions): string[] {
    const newKeys = [];
    const jsonAnyGetter: JsonAnyGetterPrivateOptions = getMetadata('jackson:JsonAnyGetter', obj, null, options.annotationsEnabled);
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
        !hasMetadata('jackson:JsonProperty', obj, jsonAnyGetter.for, options.annotationsEnabled)) {
        oldKeys.splice(oldKeys.indexOf(jsonAnyGetter.for), 1);
      } else {
        oldKeys = [];
      }
    }
    return [...new Set([...oldKeys, ...newKeys])];
  }

  private stringifyJsonPropertyOrder(obj: any, options: JsonStringifierTransformerOptions): string[] {
    let keys = Object.keys(obj);
    const jsonPropertyOrder: JsonPropertyOrderOptions =
      getMetadata('jackson:JsonPropertyOrder', obj.constructor, null, options.annotationsEnabled);
    if (jsonPropertyOrder) {
      if (jsonPropertyOrder.alphabetic) {
        keys = keys.sort();
      } else if (jsonPropertyOrder.value) {
        keys = jsonPropertyOrder.value.concat(keys.filter(item => !jsonPropertyOrder.value.includes(item)));
      }
    }
    return keys;
  }

  private stringifyJsonProperty(replacement: any, obj: any, key: string, options: JsonStringifierTransformerOptions): void {
    const jsonProperty: JsonPropertyOptions = getMetadata('jackson:JsonProperty', obj, key, options.annotationsEnabled);
    const hasJsonIgnore = hasMetadata('jackson:JsonIgnore', obj.constructor, key, options.annotationsEnabled);
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

  private stringifyJsonRawValue(replacement: any, obj: any, key: string, options: JsonStringifierTransformerOptions): void {
    const jsonRawValue = hasMetadata('jackson:JsonRawValue', obj.constructor, key, options.annotationsEnabled);
    if (jsonRawValue) {
      replacement[key] = JSON.parse(replacement[key]);
    }
  }

  private stringifyJsonValue(obj: any, options: JsonStringifierTransformerOptions): null | any  {
    const jsonValue: JsonValuePrivateOptions = getMetadata('jackson:JsonValue', obj, null, options.annotationsEnabled);
    if (jsonValue) {
      return (typeof obj[jsonValue.propertyKey] === 'function') ? obj[jsonValue.propertyKey]() : obj[jsonValue.propertyKey];
    }
    return null;
  }

  private stringifyJsonRootName(replacement: any, obj: any, options: JsonStringifierTransformerOptions): any {
    const jsonRootName: JsonRootNameOptions = getMetadata('jackson:JsonRootName', obj.constructor, null, options.annotationsEnabled);
    if (jsonRootName && jsonRootName.value) {
      const newReplacement = {};
      newReplacement[jsonRootName.value] = replacement;
      return newReplacement;
    }
    return replacement;
  }

  private stringifyJsonSerialize(replacement: any, obj: any, key: string, options: JsonStringifierTransformerOptions): void {
    const jsonSerialize: JsonSerializeOptions = getMetadata('jackson:JsonSerialize', obj, key, options.annotationsEnabled);
    if (jsonSerialize && jsonSerialize.using) {
      replacement[key] = jsonSerialize.using(replacement[key]);
    }
  }

  private stringifyHasJsonIgnore(obj: any, key: string, options: JsonStringifierTransformerOptions): boolean {
    const hasJsonIgnore = hasMetadata('jackson:JsonIgnore', obj.constructor, key, options.annotationsEnabled);
    const hasJsonProperty = hasMetadata('jackson:JsonProperty', obj, key, options.annotationsEnabled);

    if (!hasJsonIgnore) {
      const jsonIgnoreProperties: JsonIgnorePropertiesOptions =
        getMetadata('jackson:JsonIgnoreProperties', obj.constructor, null, options.annotationsEnabled);
      if (jsonIgnoreProperties && !jsonIgnoreProperties.allowGetters) {
        if (jsonIgnoreProperties.value.includes(key)) {return true; }
        const jsonProperty: JsonPropertyOptions =
          getMetadata('jackson:JsonProperty', obj, key, options.annotationsEnabled);
        if (jsonProperty && jsonIgnoreProperties.value.includes(jsonProperty.value)) {return true; }
      }
    }

    return hasJsonIgnore && !hasJsonProperty;
  }

  private stringifyJsonInclude(obj: any, key: string, options: JsonStringifierTransformerOptions): boolean {
    const keyJsonInclude: JsonIncludeOptions =
      getMetadata('jackson:JsonInclude', obj, key, options.annotationsEnabled);
    const constructorJsonInclude: JsonIncludeOptions =
      getMetadata('jackson:JsonInclude', obj.constructor, null, options.annotationsEnabled);
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

  private stringifyJsonIgnoreType(obj: any, options: JsonStringifierTransformerOptions): boolean {
    return hasMetadata('jackson:JsonIgnoreType', obj.constructor, null, options.annotationsEnabled);
  }

  private stringifyHasJsonBackReference(obj: any, key: string, options: JsonStringifierTransformerOptions): boolean {
    return hasMetadata('jackson:JsonBackReference', obj.constructor, key, options.annotationsEnabled);
  }

  private stringifyJsonTypeInfo(replacement: any, obj: any, options: JsonStringifierTransformerOptions): any {
    const jsonTypeInfo: JsonTypeInfoOptions = getMetadata('jackson:JsonTypeInfo', obj.constructor, null, options.annotationsEnabled);
    if (jsonTypeInfo) {
      let jsonTypeName: string;

      const jsonSubTypes: JsonSubTypesOptions = getMetadata('jackson:JsonSubTypes', obj.constructor, null, options.annotationsEnabled);
      if (jsonSubTypes && jsonSubTypes.types) {
        for (const subType of jsonSubTypes.types) {
          if (subType.name && isSameConstructor(subType.class(), obj.constructor)) {
            jsonTypeName = subType.name;
            break;
          }
        }
      }

      if (!jsonTypeName) {
        const jsonTypeNameOptions: JsonTypeNamePrivateOptions =
          getMetadata('jackson:JsonTypeName', obj.constructor, null, options.annotationsEnabled);
        if (jsonTypeNameOptions && jsonTypeNameOptions.value != null && jsonTypeNameOptions.value.trim() !== '') {
          jsonTypeName = jsonTypeNameOptions.value;
        }
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

  private stringifyPropertyJsonFormat(replacement: any, obj: any, key: string, options: JsonStringifierTransformerOptions): any {
    const jsonFormat: JsonFormatOptions = getMetadata('jackson:JsonFormat', obj, key, options.annotationsEnabled);
    if (jsonFormat) {
      return this.stringifyJsonFormat(jsonFormat, replacement[key], options);
    }
    return replacement[key];
  }

  private stringifyClassJsonFormat(obj: any, options: JsonStringifierTransformerOptions): any {
    const jsonFormat: JsonFormatOptions = getMetadata('jackson:JsonFormat', obj.constructor, null, options.annotationsEnabled);
    if (jsonFormat) {
      return this.stringifyJsonFormat(jsonFormat, obj, options);
    }
    return obj;
  }

  private stringifyJsonFormat(jsonFormat: JsonFormatOptions, value: any, options: JsonStringifierTransformerOptions): any {
    let formattedValue = value;
    switch (jsonFormat.shape) {
    case JsonFormatShape.ARRAY:
      if (typeof value === 'object') {
        if (value instanceof Set || value instanceof Map) {
          formattedValue = [...value];
        } else {
          formattedValue = Object.values(value);
        }
      } else {
        formattedValue = [value];
      }
      break;
    case JsonFormatShape.BOOLEAN:
      formattedValue = !!value;
      break;
    case JsonFormatShape.NUMBER_FLOAT:
      if (value instanceof Date) {
        formattedValue = parseFloat(value.getTime().toString());
      } else {
        formattedValue = parseFloat(value);
      }
      break;
    case JsonFormatShape.NUMBER_INT:
      if (value instanceof Date) {
        formattedValue = value.getTime();
      } else {
        formattedValue = parseInt(value, 10);
      }
      break;
    case JsonFormatShape.OBJECT:
      if (value instanceof Set) {
        formattedValue = Object.assign({}, [...value]);
      } else if (value instanceof Map) {
        const newValue = {};
        for (const [k, val] of value) {
          newValue[k] = val;
        }
        formattedValue = newValue;
      } else {
        formattedValue = Object.assign({}, value);
      }
      break;
    case JsonFormatShape.SCALAR:
      if (!isVariablePrimitiveType(value)) {
        formattedValue = null;
      }
      break;
    case JsonFormatShape.STRING:
      if (value instanceof Date) {
        const locale = jsonFormat.locale;
        require('dayjs/locale/' + locale);
        const timezone = (jsonFormat.timezone) ? { timeZone: jsonFormat.timezone } : {};
        formattedValue = dayjs(value.toLocaleString('en-US', timezone)).locale(locale).format(jsonFormat.pattern);
      } else {
        if (value != null && value.constructor === Number) {
          if (jsonFormat.radix != null && jsonFormat.radix.constructor === Number) {
            formattedValue = value.toString(jsonFormat.radix);
          } else if (jsonFormat.toExponential != null && jsonFormat.toExponential.constructor === Number) {
            formattedValue = value.toExponential(jsonFormat.toExponential);
          } else if (jsonFormat.toFixed != null && jsonFormat.toFixed.constructor === Number) {
            formattedValue = value.toFixed(jsonFormat.toFixed);
          } else if (jsonFormat.toPrecision != null && jsonFormat.toPrecision.constructor === Number) {
            formattedValue = value.toPrecision(jsonFormat.toPrecision);
          } else {
            formattedValue = value.toString();
          }
        } else {
          formattedValue = value.toString();
        }
      }
      break;
    }
    return formattedValue;
  }

  private stringifyHasJsonView(obj: any, key: string, options: JsonStringifierTransformerOptions): boolean {
    if (options.withViews) {
      const jsonView: JsonViewOptions = getMetadata('jackson:JsonView', obj.constructor, key, options.annotationsEnabled);
      if (jsonView && jsonView.value) {
        const views = jsonView.value();
        const withViews = options.withViews();
        for (const view of views) {
          for (const withView of withViews) {
            if (isSameConstructorOrExtensionOf(view, withView)) {
              return true;
            }
          }
        }
        return false;
      }
    }
    return true;
  }

  private stringifyJsonUnwrapped(replacement: any, obj: any, key: string, options: JsonStringifierTransformerOptions): void {
    const jsonUnwrapped: JsonUnwrappedOptions = getMetadata('jackson:JsonUnwrapped', obj, key, options.annotationsEnabled);
    const hasJsonTypeInfo = (typeof obj[key] === 'object') ?
      hasMetadata('jackson:JsonTypeInfo', obj[key].constructor, null, options.annotationsEnabled) : false;

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

  private stringifyJsonIdentityInfo(replacement: any, obj: any, options: JsonStringifierTransformerOptions): void {
    const jsonIdentityInfo: JsonIdentityInfoOptions =
      getMetadata('jackson:JsonIdentityInfo', obj.constructor, null, options.annotationsEnabled);

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
            if (!Object.hasOwnProperty.call(replacement, jsonIdentityInfo.property)) {
              // eslint-disable-next-line max-len
              throw new JacksonError(`Invalid Object Id definition for "${obj.constructor.name}": cannot find property with name "${jsonIdentityInfo.property}"`);
            }
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

  private hasJsonIdentityReferenceAlwaysAsId(obj: any, options: JsonStringifierTransformerOptions): boolean {
    const jsonIdentityInfo: JsonIdentityInfoOptions =
      getMetadata('jackson:JsonIdentityInfo', obj.constructor, null, options.annotationsEnabled);
    const jsonIdentityReference: JsonIdentityReferenceOptions =
      getMetadata('jackson:JsonIdentityReference', obj.constructor, null, options.annotationsEnabled);
    return jsonIdentityReference != null && jsonIdentityReference.alwaysAsId && jsonIdentityInfo != null;
  }

  private stringifyJsonIdentityReference(replacement: any, obj: any, options: JsonStringifierTransformerOptions): any {
    const jsonIdentityInfo: JsonIdentityInfoOptions =
      getMetadata('jackson:JsonIdentityInfo', obj.constructor, null, options.annotationsEnabled);
    return replacement[jsonIdentityInfo.property];
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

  private stringifyMap(map: Map<any, any>, options: JsonStringifierTransformerOptions): any {
    const newValue = {};
    for (const [k, val] of map) {
      newValue[k.toString()] = val;
    }
    return newValue;
  }

  private isPropertyKeyExcludedByJsonFilter(filter: JsonStringifierFilterOptions,
                                            obj: any, key: string,
                                            options: JsonStringifierTransformerOptions): boolean {
    if (filter.values == null) {
      return false;
    }
    const jsonProperty: JsonPropertyOptions =
      getMetadata('jackson:JsonProperty', obj, key, options.annotationsEnabled);
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
    const jsonFilter: JsonFilterOptions =
      getMetadata('jackson:JsonFilter', obj.constructor, null, options.annotationsEnabled);
    if (jsonFilter) {
      const filter = options.filters[jsonFilter.name];
      if (filter) {
        return this.isPropertyKeyExcludedByJsonFilter(filter, obj, key, options);
      }
    }
    return false;
  }

  private stringifyJsonFilter(replacement: any, obj: any, key: string, options: JsonStringifierTransformerOptions) {
    const jsonFilter: JsonFilterOptions = getMetadata('jackson:JsonFilter', obj, key, options.annotationsEnabled);
    if (jsonFilter) {
      const filter = options.filters[jsonFilter.name];
      if (filter) {
        replacement[key] = cloneClassInstance(obj[key]);
        // eslint-disable-next-line guard-for-in
        for (const propertyKey in obj[key]) {
          const isExluded = this.isPropertyKeyExcludedByJsonFilter(filter, obj[key], propertyKey, options);
          if (isExluded) {
            delete replacement[key][propertyKey];
          }
        }
      }
    }
  }

  private isPrependJsonAppend(obj: any, options: JsonStringifierTransformerOptions) {
    const jsonAppend: JsonAppendOptions =
      getMetadata('jackson:JsonAppend', obj.constructor, null, options.annotationsEnabled);
    return jsonAppend && jsonAppend.prepend;
  }

  private stringifyJsonAppend(replacement: any, obj: any, options: JsonStringifierTransformerOptions) {
    const jsonAppend: JsonAppendOptions =
      getMetadata('jackson:JsonAppend', obj.constructor, null, options.annotationsEnabled);
    if (jsonAppend) {
      for (const attr of jsonAppend.attrs) {
        const attributeKey = attr.value;
        if (attributeKey != null) {
          if (attr.required && !Object.hasOwnProperty.call(options.attributes, attributeKey)) {
            // eslint-disable-next-line max-len
            throw new JacksonError(`Missing @JsonAppend() required attribute "${attributeKey}" for class "${obj.constructor.name}".`);
          }

          const value = options.attributes[attributeKey];
          const key = attr.propName ? attr.propName : attributeKey;

          switch (attr.include) {
          case JsonIncludeType.NON_EMPTY:
            if (value == null || ((typeof value === 'object' || typeof value === 'string') && Object.keys(value).length === 0)) {
              continue;
            }
            break;
          case JsonIncludeType.NON_NULL:
            if (value == null) {
              continue;
            }
            break;
          }
          replacement[key] = value;
        }
      }
    }
  }

  private stringifyJsonNaming(replacement: any, obj: any, options: JsonStringifierTransformerOptions): void {
    const jsonNamingOptions: JsonNamingOptions = getMetadata('jackson:JsonNaming', obj.constructor, null, options.annotationsEnabled);
    if (jsonNamingOptions && jsonNamingOptions.strategy != null) {
      // eslint-disable-next-line guard-for-in
      for (const key in replacement) {
        const tokens = key.split(/(?=[A-Z])/);
        const tokensLength = tokens.length;
        let newKey = '';
        for (let i = 0; i < tokensLength; i++) {
          let token = tokens[i];
          let separator = '';
          switch (jsonNamingOptions.strategy) {
          case JsonNamingStrategy.KEBAB_CASE:
            token = token.toLowerCase();
            separator = '-';
            break;
          case JsonNamingStrategy.LOWER_CAMEL_CASE:
            if (i === 0) {
              token = token.toLowerCase();
            } else {
              token = token.charAt(0).toUpperCase() + token.slice(1);
            }
            break;
          case JsonNamingStrategy.LOWER_CASE:
            token = token.toLowerCase();
            break;
          case JsonNamingStrategy.LOWER_DOT_CASE:
            token = token.toLowerCase();
            separator = '.';
            break;
          case JsonNamingStrategy.SNAKE_CASE:
            token = token.toLowerCase();
            separator = (i > 0 && tokens[i - 1].endsWith('_')) ? '' : '_';
            break;
          case JsonNamingStrategy.UPPER_CAMEL_CASE:
            token = token.charAt(0).toUpperCase() + token.slice(1);
            break;
          }
          newKey += (newKey !== '' && token.length > 1) ? separator + token : token;
        }
        if (newKey !== key) {
          replacement[newKey] = replacement[key];
          delete replacement[key];
        }
      }
    }
  }
}
