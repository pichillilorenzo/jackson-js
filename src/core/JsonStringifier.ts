/**
 * @packageDocumentation
 * @module Core
 */

import {
  JsonAppendOptions,
  JsonClassOptions,
  JsonDecoratorOptions,
  JsonFilterOptions,
  JsonFormatOptions,
  JsonIdentityInfoOptions,
  JsonIdentityReferenceOptions,
  JsonIgnorePropertiesOptions,
  JsonIncludeOptions,
  JsonNamingOptions,
  JsonParserContext,
  JsonParserTransformerContext,
  JsonPropertyOptions,
  JsonPropertyOrderOptions,
  JsonRootNameOptions,
  JsonSerializeOptions,
  JsonStringifierContext,
  JsonStringifierFilterOptions,
  JsonStringifierTransformerContext,
  JsonSubTypesOptions,
  JsonTypeIdResolverOptions,
  JsonTypeInfoOptions,
  JsonUnwrappedOptions,
  JsonViewOptions
} from '../@types';
import {JsonPropertyAccess} from '../decorators/JsonProperty';
import {JsonIncludeType} from '../decorators/JsonInclude';
import {
  getDeepestClass,
  getDefaultPrimitiveTypeValue,
  getDefaultValue,
  getMetadata,
  getObjectKeysWithPropertyDescriptorNames,
  hasMetadata,
  isConstructorPrimitiveType,
  isIterableNoMapNoString,
  isObjLiteral,
  isSameConstructor,
  isSameConstructorOrExtensionOf,
  isValueEmpty,
  isVariablePrimitiveType,
  objectHasOwnPropertyWithPropertyDescriptorNames
} from '../util';
import {JsonTypeInfoAs, JsonTypeInfoId} from '../decorators/JsonTypeInfo';
import {JsonFormatShape} from '../decorators/JsonFormat';
import {SerializationFeature} from '../databind/SerializationFeature';
import {ObjectIdGenerator} from '../decorators/JsonIdentityInfo';
import * as dayjs from 'dayjs';
import * as customParseFormat from 'dayjs/plugin/customParseFormat';
import {v1 as uuidv1, v3 as uuidv3, v4 as uuidv4, v5 as uuidv5} from 'uuid';
import {JacksonError} from './JacksonError';
import {
  JsonAnyGetterPrivateOptions,
  JsonGetterPrivateOptions,
  JsonTypeIdPrivateOptions,
  JsonTypeNamePrivateOptions,
  JsonValuePrivateOptions
} from '../@types/private';
import {JsonNamingStrategy} from '../decorators/JsonNaming';
import {JsonFilterType} from '../decorators/JsonFilter';
import * as cloneDeep from 'lodash.clonedeep';
import * as clone from 'lodash.clone';

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
  private _intSequenceGenerator = 1;

  /**
   *
   */
  constructor() {
  }

  /**
   *
   * @param obj
   * @param context
   */
  stringify(obj: T, context: JsonStringifierContext = {}): string {
    let newContext: JsonStringifierTransformerContext = this.convertStringifierContextToTransformerContext(context);
    newContext.mainCreator = (newContext.mainCreator && newContext.mainCreator[0] !== Object) ?
      newContext.mainCreator : [(obj != null) ? (obj.constructor as ObjectConstructor) : Object];
    newContext = cloneDeep(newContext);

    const preProcessedObj = this.transform('', obj, newContext, new Map());

    return JSON.stringify(preProcessedObj, null, newContext.format);
  }

  /**
   *
   * @param key
   * @param value
   * @param context
   * @param valueAlreadySeen: Map used to manage object circular references
   */
  transform(key: string, value: any, context: JsonStringifierTransformerContext, valueAlreadySeen: Map<any, any>): any {
    context = {
      features: [],
      filters: {},
      serializers: [],
      attributes: {},
      _internalDecorators: new Map(),
      ...context
    };
    context = cloneDeep(context);

    if (value != null && context._internalDecorators != null &&
      context._internalDecorators.size > 0) {
      let target = context.mainCreator[0];
      while (target.name && !context._internalDecorators.has(target)) {
        target = Object.getPrototypeOf(target);
      }
      if (context._internalDecorators.has(target)) {
        if (context._internalDecorators.get(target).depth === 0) {
          context._internalDecorators.delete(target);
        } else {
          context._internalDecorators.get(target).depth--;
        }
      }
    }

    if (context.forType && context.forType.has(context.mainCreator[0])) {
      context = {
        mainCreator: context.mainCreator,
        ...context,
        ...(context.forType.get(context.mainCreator[0]))
      };
      context = cloneDeep(context);
    }

    value = this.invokeCustomSerializers(key, value, context);
    value = this.stringifyJsonSerializeClass(value, context);

    if (value == null && isConstructorPrimitiveType(context.mainCreator[0])) {
      value = this.getDefaultValue(context);
    }

    if (value != null && value.constructor === Number && isNaN(value) && context.features[SerializationFeature.WRITE_NAN_AS_ZERO]) {
      value = 0;
    } else if (value === Infinity) {
      if (context.features[SerializationFeature.WRITE_POSITIVE_INFINITY_AS_NUMBER_MAX_SAFE_INTEGER]) {
        value = Number.MAX_SAFE_INTEGER;
      } else if (context.features[SerializationFeature.WRITE_POSITIVE_INFINITY_AS_NUMBER_MAX_VALUE]) {
        value = Number.MAX_VALUE;
      }
    } else if (value === -Infinity) {
      if (context.features[SerializationFeature.WRITE_NEGATIVE_INFINITY_AS_NUMBER_MIN_SAFE_INTEGER]) {
        value = Number.MIN_SAFE_INTEGER;
      } else if (context.features[SerializationFeature.WRITE_NEGATIVE_INFINITY_AS_NUMBER_MIN_VALUE]) {
        value = Number.MIN_VALUE;
      }
    } else if (value != null && value instanceof Date &&
      context.features[SerializationFeature.WRITE_DATES_AS_TIMESTAMPS]) {
      value = value.getTime();
    }

    if (value != null) {

      const currentMainCreator = context.mainCreator[0];

      const identity = this._globalValueAlreadySeen.get(value);
      if (identity) {
        return identity;
      }

      value = this.stringifyJsonFormatClass(value, context);

      if (value instanceof Map) {
        value = this.stringifyMap(value, context);
      }

      if (BigInt && value instanceof BigInt) {
        return value.toString() + 'n';
      } else if (value instanceof RegExp) {
        const replacement = value.toString();
        return replacement.substring(1, replacement.length - 1);
      } else if (value instanceof Date) {
        return value;
      } else if (typeof value === 'object' && !isIterableNoMapNoString(value)) {

        if (this.stringifyJsonIgnoreType(value, context)) {
          return null;
        }

        // Infinite recursion is already handled by JSON.stringify();
        // if (valueAlreadySeen.has(value)) {
        //   throw new JacksonError(`Infinite recursion on key "${key}" of type "${currentMainCreator.name}"`);
        // }
        valueAlreadySeen.set(value, (identity) ? identity : null);

        let replacement = {};
        const jsonValue = this.stringifyJsonValue(value, context);
        if (jsonValue) {
          replacement = jsonValue;
          return replacement;
        }

        if (this.isPrependJsonAppend(value, context)) {
          this.stringifyJsonAppend(replacement, value, context);
        }

        let keys = getObjectKeysWithPropertyDescriptorNames(value);
        keys = this.stringifyJsonAnyGetter(replacement, value, keys, context);

        const namingMap = new Map<string, string>();

        for (const k of keys) {
          if (!this.stringifyHasJsonIgnore(value, k, context) &&
            this.stringifyJsonInclude(value, k, context) &&
            this.stringifyHasJsonView(value, k, context) &&
            !this.stringifyHasJsonBackReference(value, k, context) &&
            !this.stringifyIsPropertyKeyExcludedByJsonFilter(value, k, context) &&
            objectHasOwnPropertyWithPropertyDescriptorNames(value, k)) {

            const newKey = this.stringifyJsonNaming(replacement, value, k, context);
            namingMap.set(k, newKey);

            // if it has a JsonIdentityReference, then we can skip all these methods because
            // the entire object will be replaced later by the identity value
            if (!this.hasJsonIdentityReferenceAlwaysAsId(value, context)) {

              if (value === value[k] && context.features[SerializationFeature.FAIL_ON_SELF_REFERENCES]) {
                // eslint-disable-next-line max-len
                throw new JacksonError(`Direct self-reference leading to cycle (through reference chain: ${currentMainCreator.name}["${k}"])`);
              }

              this.propagateDecorators(value, k, context);

              replacement[newKey] = this.stringifyJsonGetter(value, k, context);
              if (replacement[newKey] != null) {
                if (replacement[newKey] instanceof Map || isObjLiteral(replacement[newKey])) {
                  this.stringifyJsonIncludeMap(replacement, k, newKey, context);
                }
                replacement[newKey] = this.stringifyJsonFormatProperty(replacement, value, k, newKey, context);
                this.stringifyJsonSerializeProperty(replacement, value, k, newKey, context);
                this.stringifyJsonRawValue(replacement, value, k, newKey, context);
                this.stringifyJsonFilter(replacement, value, k, newKey, context);
                this.stringifyJsonProperty(replacement, value, k, newKey, context);
                this.stringifyJsonUnwrapped(replacement, value, k, context, valueAlreadySeen);
              }
            } else {
              replacement[newKey] = this.stringifyJsonGetter(value, k, context);
            }
          }
        }

        if (!this.isPrependJsonAppend(value, context)) {
          this.stringifyJsonAppend(replacement, value, context);
        }

        this.stringifyJsonIdentityInfo(replacement, value, context);

        if (this.hasJsonIdentityReferenceAlwaysAsId(value, context)) {
          replacement = this.stringifyJsonIdentityReference(replacement, value, context);
        } else {
          // eslint-disable-next-line guard-for-in
          for (const k in replacement) {
            const oldKey = namingMap.get(k);
            const newContext: JsonStringifierTransformerContext = cloneDeep(context);
            let newMainCreator;
            const jsonClass: JsonClassOptions = getMetadata('jackson:JsonClass', currentMainCreator, oldKey, context);
            if (jsonClass && jsonClass.class) {
              newMainCreator = jsonClass.class();
            } else {
              newMainCreator = [Object];
            }
            if (replacement[k] != null && replacement[k].constructor !== Object) {
              newMainCreator[0] = replacement[k].constructor;
            }
            newContext.mainCreator = newMainCreator;
            replacement[k] = this.transform(oldKey, replacement[k], newContext, new Map(valueAlreadySeen));
          }
          replacement = this.stringifyJsonRootName(replacement, value, context);
          replacement = this.stringifyJsonTypeInfo(replacement, value, context);
        }

        const hasJsonPropertyOrder = hasMetadata('jackson:JsonPropertyOrder', currentMainCreator, null, context);
        const keysShouldBeSorted = hasJsonPropertyOrder || context.features[SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS];

        if (keysShouldBeSorted) {
          let sortedKeyes = getObjectKeysWithPropertyDescriptorNames(replacement);
          if (context.features[SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS]) {
            sortedKeyes = sortedKeyes.sort();
          } else {
            sortedKeyes = this.stringifyJsonPropertyOrder(replacement, value, context);
          }
          const newReplacement = {};
          for (const sortedKey of sortedKeyes) {
            if (Object.hasOwnProperty.call(replacement, sortedKey)) {
              newReplacement[sortedKey] = replacement[sortedKey];
            }
          }
          replacement = newReplacement;
        }

        return replacement;
      } else if (isIterableNoMapNoString(value)) {
        const replacement = this.stringifyIterable(key, value, context, valueAlreadySeen);
        return replacement;
      }
    }

    return value;
  }

  /**
   *
   * @param context
   */
  private convertStringifierContextToTransformerContext(context: JsonParserContext): JsonParserTransformerContext {
    const newContext: JsonStringifierTransformerContext = {
      mainCreator: context.mainCreator ? context.mainCreator() : [Object]
    };
    for (const key in context) {
      if (key !== 'mainCreator') {
        newContext[key] = context[key];
      }
    }
    return newContext;
  }

  /**
   *
   * @param key
   * @param value
   * @param context
   */
  private invokeCustomSerializers(key: string, value: any, context: JsonStringifierTransformerContext): any {
    if (context.serializers) {
      const currentMainCreator = context.mainCreator[0];
      for (const serializer of context.serializers) {
        if (serializer.type != null) {
          const classType = serializer.type();
          if (
            (value != null && typeof classType === 'string' && classType !== typeof value) ||
            (typeof classType !== 'string' && currentMainCreator != null &&
              !isSameConstructorOrExtensionOf(classType, currentMainCreator))
          ) {
            continue;
          }
        }
        value = serializer.mapper(key, value, context);
      }
    }
    return value;
  }

  /**
   *
   * @param context
   */
  private getDefaultValue(context: JsonStringifierTransformerContext): any | null {
    let defaultValue = null;
    const currentMainCreator = context.mainCreator[0];
    if (currentMainCreator === String &&
      (context.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        context.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_STRING_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(String);
    } else if (currentMainCreator === Number &&
      (context.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        context.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_NUMBER_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(Number);
    } else if (currentMainCreator === Boolean &&
      (context.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        context.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_BOOLEAN_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(Boolean);
    } else if (BigInt && currentMainCreator === BigInt &&
      (context.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        context.features[SerializationFeature.SET_DEFAULT_VALUE_FOR_BIGINT_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(BigInt);
    }
    return defaultValue;
  }

  /**
   * Propagate decorators to class properties,
   * only for the first level (depth) of recursion.
   *
   * Used, for example, in case of decorators applied on an iterable, such as an Array.
   * In this case, the decorators are applied to each item of the iterable and not on the iterable itself.JsonFormat
   * @param obj
   * @param key
   * @param context
   */
  private propagateDecorators(obj: any, key: string, context: JsonStringifierTransformerContext): void {
    const currentMainCreator = context.mainCreator[0];
    const jsonClass: JsonClassOptions = getMetadata('jackson:JsonClass', currentMainCreator, key, context);

    // Decorators list that can be propagated
    const metadataKeys = [
      'jackson:JsonIgnoreProperties',
      'jackson:JsonTypeInfo',
      'jackson:JsonSubTypes',
      'jackson:JsonTypeIdResolver',
      'jackson:JsonFilter',
      'jackson:JsonIdentityInfo',
      'jackson:JsonIdentityReference'
    ];

    const decoratorsNameFound = [];
    const decoratorsToBeApplied = {
      depth: 1
    };
    let deepestClass = null;
    if (jsonClass) {
      deepestClass = getDeepestClass(jsonClass.class());
    }

    for (const metadataKey of metadataKeys) {
      const jsonDecoratorOptions: JsonDecoratorOptions = getMetadata(metadataKey, currentMainCreator, key, context);
      if (jsonDecoratorOptions) {
        decoratorsNameFound.push(metadataKey.replace('jackson:', ''));
        decoratorsToBeApplied[metadataKey] = jsonDecoratorOptions;
      }
    }

    if (deepestClass != null && decoratorsNameFound.length > 0) {
      context._internalDecorators.set(deepestClass, decoratorsToBeApplied);
    } else if (!jsonClass && decoratorsNameFound.length > 0) {
      // eslint-disable-next-line max-len
      throw new JacksonError(`Missing mandatory @JsonClass() for [${decoratorsNameFound.map((ann) => '@' + ann + '()').join(', ')}] at ${currentMainCreator.name}["${key}"]`);
    }
  }

  /**
   *
   * @param obj
   * @param key
   * @param context
   */
  private stringifyJsonGetter(obj: any, key: string, context: JsonStringifierTransformerContext): any {
    const currentMainCreator = context.mainCreator[0];

    const jsonGetter: JsonGetterPrivateOptions = getMetadata('jackson:JsonGetter', currentMainCreator, key, context);
    const jsonIgnoreProperties: JsonIgnorePropertiesOptions =
      getMetadata('jackson:JsonIgnoreProperties', currentMainCreator, null, context);
    if (jsonGetter &&
      !(jsonIgnoreProperties && !jsonIgnoreProperties.allowGetters && jsonIgnoreProperties.value.includes(key)) ) {
      return (typeof obj[jsonGetter.propertyKey] === 'function') ? obj[jsonGetter.propertyKey]() : obj[jsonGetter.propertyKey];
    }
    return obj[key];
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param keys
   * @param context
   */
  private stringifyJsonAnyGetter(replacement: any, obj: any, keys: string[], context: JsonStringifierTransformerContext): string[] {
    const currentMainCreator = context.mainCreator[0];

    const newKeys = [];
    const jsonAnyGetter: JsonAnyGetterPrivateOptions = getMetadata('jackson:JsonAnyGetter', currentMainCreator, null, context);
    if (jsonAnyGetter && obj[jsonAnyGetter.propertyKey]) {
      const map = (typeof obj[jsonAnyGetter.propertyKey] === 'function') ?
        obj[jsonAnyGetter.propertyKey]() :
        obj[jsonAnyGetter.propertyKey];

      if (!(map instanceof Map) && !isObjLiteral(map)) {
        // eslint-disable-next-line max-len
        throw new JacksonError(`Property ${currentMainCreator.name}["${jsonAnyGetter.propertyKey}"] annotated with @JsonAnyGetter() returned a "${map.constructor.name}": expected "Map" or "Object Literal".`);
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

      if (jsonAnyGetter.for && keys.includes(jsonAnyGetter.for)) {
        keys.splice(keys.indexOf(jsonAnyGetter.for), 1);
      } else {
        keys = [];
      }
    }

    return [...new Set([...keys, ...newKeys])];
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param context
   */
  private stringifyJsonPropertyOrder(replacement: any, obj: any, context: JsonStringifierTransformerContext): string[] {
    let keys = getObjectKeysWithPropertyDescriptorNames(replacement);
    const jsonPropertyOrder: JsonPropertyOrderOptions =
      getMetadata('jackson:JsonPropertyOrder', context.mainCreator[0], null, context);
    if (jsonPropertyOrder) {
      if (jsonPropertyOrder.alphabetic) {
        keys = keys.sort();
      } else if (jsonPropertyOrder.value) {
        keys = jsonPropertyOrder.value.concat(keys.filter(item => !jsonPropertyOrder.value.includes(item)));
      }
    }
    return keys;
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param oldKey
   * @param newKey
   * @param context
   */
  private stringifyJsonProperty(replacement: any, obj: any, oldKey: string, newKey: string,
                                context: JsonStringifierTransformerContext): void {
    const jsonProperty: JsonPropertyOptions = getMetadata('jackson:JsonProperty', context.mainCreator[0], oldKey, context);
    if (jsonProperty) {
      const isIgnored = jsonProperty.access === JsonPropertyAccess.WRITE_ONLY;
      if (!isIgnored && jsonProperty.value !== oldKey) {
        replacement[jsonProperty.value] = replacement[newKey];
        delete replacement[newKey];
      } else if (isIgnored) {
        delete replacement[newKey];
      }
    }
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param oldKey
   * @param newKey
   * @param context
   */
  private stringifyJsonRawValue(replacement: any, obj: any, oldKey: string, newKey: string,
                                context: JsonStringifierTransformerContext): void {
    const jsonRawValue = hasMetadata('jackson:JsonRawValue', context.mainCreator[0], oldKey, context);
    if (jsonRawValue) {
      replacement[newKey] = JSON.parse(replacement[newKey]);
    }
  }

  /**
   *
   * @param obj
   * @param context
   */
  private stringifyJsonValue(obj: any, context: JsonStringifierTransformerContext): null | any  {
    const jsonValue: JsonValuePrivateOptions = getMetadata('jackson:JsonValue', context.mainCreator[0], null, context);
    if (jsonValue) {
      return (typeof obj[jsonValue.propertyKey] === 'function') ? obj[jsonValue.propertyKey]() : obj[jsonValue.propertyKey];
    }
    return null;
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param context
   */
  private stringifyJsonRootName(replacement: any, obj: any, context: JsonStringifierTransformerContext): any {
    const jsonRootName: JsonRootNameOptions = getMetadata('jackson:JsonRootName', context.mainCreator[0], null, context);
    if (jsonRootName && jsonRootName.value) {
      const newReplacement = {};
      newReplacement[jsonRootName.value] = replacement;
      return newReplacement;
    }
    return replacement;
  }

  /**
   *
   * @param obj
   * @param context
   */
  private stringifyJsonSerializeClass(obj: any, context: JsonStringifierTransformerContext): any {
    const jsonSerialize: JsonSerializeOptions =
      getMetadata('jackson:JsonSerialize', context.mainCreator[0], null, context);
    if (jsonSerialize && jsonSerialize.using) {
      return jsonSerialize.using(obj);
    }
    return obj;
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param oldKey
   * @param newKey
   * @param context
   */
  private stringifyJsonSerializeProperty(replacement: any, obj: any, oldKey: string, newKey: string,
                                         context: JsonStringifierTransformerContext): void {
    const jsonSerialize: JsonSerializeOptions = getMetadata('jackson:JsonSerialize', context.mainCreator[0], oldKey, context);
    if (jsonSerialize && jsonSerialize.using) {
      replacement[newKey] = jsonSerialize.using(replacement[newKey]);
    }
  }

  /**
   *
   * @param obj
   * @param key
   * @param context
   */
  private stringifyHasJsonIgnore(obj: any, key: string, context: JsonStringifierTransformerContext): boolean {
    const currentMainCreator = context.mainCreator[0];

    const hasJsonIgnore = hasMetadata('jackson:JsonIgnore', currentMainCreator, key, context);

    if (!hasJsonIgnore) {
      const jsonIgnoreProperties: JsonIgnorePropertiesOptions =
        getMetadata('jackson:JsonIgnoreProperties', currentMainCreator, null, context);
      if (jsonIgnoreProperties) {
        if (jsonIgnoreProperties.value.includes(key)) {
          const hasJsonGetter = hasMetadata('jackson:JsonGetter', currentMainCreator, key, context);
          if (jsonIgnoreProperties.allowGetters && hasJsonGetter) {
            return false;
          }
          return true;
        }
        const jsonProperty: JsonPropertyOptions =
          getMetadata('jackson:JsonProperty', currentMainCreator, key, context);
        if (jsonProperty && jsonIgnoreProperties.value.includes(jsonProperty.value)) {
          return true;
        }
      }
    }

    return hasJsonIgnore;
  }

  /**
   *
   * @param obj
   * @param key
   * @param context
   */
  private stringifyJsonInclude(obj: any, key: string, context: JsonStringifierTransformerContext): boolean {
    const currentMainCreator = context.mainCreator[0];

    const keyJsonInclude: JsonIncludeOptions =
      getMetadata('jackson:JsonInclude', currentMainCreator, key, context);
    const constructorJsonInclude: JsonIncludeOptions =
      getMetadata('jackson:JsonInclude', currentMainCreator, null, context);
    const jsonInclude = (keyJsonInclude) ? keyJsonInclude : constructorJsonInclude;

    if (jsonInclude) {
      const value = obj[key];
      switch (jsonInclude.value) {
      case JsonIncludeType.NON_EMPTY:
        return !isValueEmpty(value);
      case JsonIncludeType.NON_NULL:
        return value != null;
      case JsonIncludeType.NON_DEFAULT:
        return value !== getDefaultValue(value) && !isValueEmpty(value);
      case JsonIncludeType.CUSTOM:
        return !jsonInclude.valueFilter(value);
      }
    }

    return true;
  }

  /**
   *
   * @param replacement
   * @param key
   * @param context
   */
  private stringifyJsonIncludeMap(replacement: any, oldKey: string, newKey: string, context: JsonStringifierTransformerContext): void {
    const currentMainCreator = context.mainCreator[0];

    const keyJsonInclude: JsonIncludeOptions =
      getMetadata('jackson:JsonInclude', currentMainCreator, oldKey, context);
    const constructorJsonInclude: JsonIncludeOptions =
      getMetadata('jackson:JsonInclude', currentMainCreator, null, context);
    const jsonInclude = (keyJsonInclude) ? keyJsonInclude : constructorJsonInclude;

    const map: Map<any, any> | Record<string, any> = clone(replacement[newKey]);

    if (jsonInclude && jsonInclude.content != null && jsonInclude.content !== JsonIncludeType.ALWAYS) {
      const mapIterable = (map instanceof Map) ? map : Object.entries(map);
      for (const [k, value] of mapIterable) {
        let shouldBeDeleted = false;
        switch (jsonInclude.content) {
        case JsonIncludeType.NON_EMPTY:
          if (isValueEmpty(value)) {
            shouldBeDeleted = true;
          }
          break;
        case JsonIncludeType.NON_NULL:
          if (value == null) {
            shouldBeDeleted = true;
          }
          break;
        case JsonIncludeType.NON_DEFAULT:
          if (value === getDefaultValue(value) || isValueEmpty(value)) {
            shouldBeDeleted = true;
          }
          break;
        case JsonIncludeType.CUSTOM:
          if (jsonInclude.contentFilter(value)) {
            shouldBeDeleted = true;
          }
          break;
        }

        if (shouldBeDeleted) {
          if (map instanceof Map) {
            map.delete(k);
          } else {
            delete map[k];
          }
        }
      }
    }

    replacement[newKey] = map;
  }

  /**
   *
   * @param obj
   * @param context
   */
  private stringifyJsonIgnoreType(obj: any, context: JsonStringifierTransformerContext): boolean {
    return hasMetadata('jackson:JsonIgnoreType', context.mainCreator[0], null, context);
  }

  /**
   *
   * @param obj
   * @param key
   * @param context
   */
  private stringifyHasJsonBackReference(obj: any, key: string, context: JsonStringifierTransformerContext): boolean {
    return hasMetadata('jackson:JsonBackReference', context.mainCreator[0], key, context);
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param context
   */
  private stringifyJsonTypeInfo(replacement: any, obj: any, context: JsonStringifierTransformerContext): any {
    const currentMainCreator = context.mainCreator[0];

    const jsonTypeInfo: JsonTypeInfoOptions = getMetadata('jackson:JsonTypeInfo', currentMainCreator, null, context);
    if (jsonTypeInfo) {
      let jsonTypeName: string;

      const jsonTypeIdResolver: JsonTypeIdResolverOptions =
        getMetadata('jackson:JsonTypeIdResolver', currentMainCreator, null, context);
      if (jsonTypeIdResolver && jsonTypeIdResolver.resolver) {
        jsonTypeName = jsonTypeIdResolver.resolver.idFromValue(obj, context);
      }

      if (!jsonTypeName) {
        const jsonTypeId: JsonTypeIdPrivateOptions =
          getMetadata('jackson:JsonTypeId', currentMainCreator, null, context);
        if (jsonTypeId) {
          if (typeof obj[jsonTypeId.propertyKey] === 'function') {
            jsonTypeName = obj[jsonTypeId.propertyKey]();
          } else {
            jsonTypeName = obj[jsonTypeId.propertyKey];
            delete replacement[jsonTypeId.propertyKey];
          }
        }
      }

      if (!jsonTypeName) {
        const jsonSubTypes: JsonSubTypesOptions =
          getMetadata('jackson:JsonSubTypes', currentMainCreator, null, context);
        if (jsonSubTypes && jsonSubTypes.types) {
          for (const subType of jsonSubTypes.types) {
            if (subType.name && isSameConstructor(subType.class(), currentMainCreator)) {
              jsonTypeName = subType.name;
              break;
            }
          }
        }
      }

      if (!jsonTypeName) {
        const jsonTypeNameOptions: JsonTypeNamePrivateOptions =
          getMetadata('jackson:JsonTypeName', currentMainCreator, null, context);
        if (jsonTypeNameOptions && jsonTypeNameOptions.value != null && jsonTypeNameOptions.value.trim() !== '') {
          jsonTypeName = jsonTypeNameOptions.value;
        }
      }

      if (!jsonTypeName) {
        switch (jsonTypeInfo.use) {
        case JsonTypeInfoId.NAME:
          jsonTypeName = currentMainCreator.name;
          break;
        }
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

  /**
   *
   * @param replacement
   * @param obj
   * @param oldKey
   * @param newKey
   * @param context
   */
  private stringifyJsonFormatProperty(replacement: any, obj: any, oldKey: string, newKey: string,
                                      context: JsonStringifierTransformerContext): any {
    const jsonFormat: JsonFormatOptions = getMetadata('jackson:JsonFormat', context.mainCreator[0], oldKey, context);
    if (jsonFormat) {
      return this.stringifyJsonFormat(jsonFormat, replacement[newKey], context);
    }
    return replacement[newKey];
  }

  /**
   *
   * @param obj
   * @param context
   */
  private stringifyJsonFormatClass(obj: any, context: JsonStringifierTransformerContext): any {
    const jsonFormat: JsonFormatOptions = getMetadata('jackson:JsonFormat', context.mainCreator[0], null, context);
    if (jsonFormat) {
      return this.stringifyJsonFormat(jsonFormat, obj, context);
    }
    return obj;
  }

  /**
   *
   * @param jsonFormat
   * @param replacement
   * @param context
   */
  private stringifyJsonFormat(jsonFormat: JsonFormatOptions, replacement: any, context: JsonStringifierTransformerContext): any {
    let formattedValue = replacement;
    switch (jsonFormat.shape) {
    case JsonFormatShape.ARRAY:
      if (typeof replacement === 'object') {
        if (replacement instanceof Set || replacement instanceof Map) {
          formattedValue = [...replacement];
        } else {
          formattedValue = Object.values(replacement);
        }
      } else {
        formattedValue = [replacement];
      }
      break;
    case JsonFormatShape.BOOLEAN:
      formattedValue = !!replacement;
      break;
    case JsonFormatShape.NUMBER_FLOAT:
      if (replacement instanceof Date) {
        formattedValue = parseFloat(replacement.getTime().toString());
      } else {
        formattedValue = parseFloat(replacement);
      }
      break;
    case JsonFormatShape.NUMBER_INT:
      if (replacement instanceof Date) {
        formattedValue = replacement.getTime();
      } else {
        formattedValue = parseInt(replacement, 10);
      }
      break;
    case JsonFormatShape.OBJECT:
      if (replacement instanceof Set) {
        formattedValue = Object.assign({}, [...replacement]);
      } else if (replacement instanceof Map) {
        const newValue = {};
        for (const [k, val] of replacement) {
          newValue[k] = val;
        }
        formattedValue = newValue;
      } else {
        formattedValue = Object.assign({}, replacement);
      }
      break;
    case JsonFormatShape.SCALAR:
      if (!isVariablePrimitiveType(replacement)) {
        formattedValue = null;
      }
      break;
    case JsonFormatShape.STRING:
      if (replacement instanceof Date) {
        const locale = jsonFormat.locale;
        require('dayjs/locale/' + locale);
        const timezone = (jsonFormat.timezone) ? { timeZone: jsonFormat.timezone } : {};
        formattedValue = dayjs(replacement.toLocaleString('en-US', timezone)).locale(locale).format(jsonFormat.pattern);
      } else {
        if (replacement != null && replacement.constructor === Number) {
          if (jsonFormat.radix != null && jsonFormat.radix.constructor === Number) {
            formattedValue = replacement.toString(jsonFormat.radix);
          } else if (jsonFormat.toExponential != null && jsonFormat.toExponential.constructor === Number) {
            formattedValue = replacement.toExponential(jsonFormat.toExponential);
          } else if (jsonFormat.toFixed != null && jsonFormat.toFixed.constructor === Number) {
            formattedValue = replacement.toFixed(jsonFormat.toFixed);
          } else if (jsonFormat.toPrecision != null && jsonFormat.toPrecision.constructor === Number) {
            formattedValue = replacement.toPrecision(jsonFormat.toPrecision);
          } else {
            formattedValue = replacement.toString();
          }
        } else {
          formattedValue = replacement.toString();
        }
      }
      break;
    }
    return formattedValue;
  }

  /**
   *
   * @param obj
   * @param key
   * @param context
   */
  private stringifyHasJsonView(obj: any, key: string, context: JsonStringifierTransformerContext): boolean {
    if (context.withViews) {
      const jsonView: JsonViewOptions = getMetadata('jackson:JsonView', context.mainCreator[0], key, context);
      if (jsonView && jsonView.value) {
        const views = jsonView.value();
        const withViews = context.withViews();
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

  /**
   *
   * @param replacement
   * @param obj
   * @param key
   * @param context
   * @param valueAlreadySeen
   */
  private stringifyJsonUnwrapped(replacement: any, obj: any, key: string,
                                 context: JsonStringifierTransformerContext, valueAlreadySeen: Map<any, any>): void {
    const currentMainCreator = context.mainCreator[0];

    const newContext = cloneDeep(context);
    let newMainCreator;
    const jsonClass: JsonClassOptions = getMetadata('jackson:JsonClass', currentMainCreator, key, context);
    if (jsonClass && jsonClass.class) {
      newMainCreator = jsonClass.class();
    } else {
      newMainCreator = [Object];
    }
    if (obj[key] != null && obj[key].constructor !== Object) {
      newMainCreator[0] = obj[key].constructor;
    }
    newContext.mainCreator = newMainCreator;

    const jsonUnwrapped: JsonUnwrappedOptions = getMetadata('jackson:JsonUnwrapped', currentMainCreator, key, context);
    const hasJsonTypeInfo = (typeof obj[key] === 'object') ?
      hasMetadata('jackson:JsonTypeInfo', newContext.mainCreator, null, newContext) : false;

    if (jsonUnwrapped) {
      if (hasJsonTypeInfo) {
        // eslint-disable-next-line max-len
        throw new JacksonError(`Unwrapped property requires use of type information: cannot serialize (through reference chain: ${currentMainCreator.name}["${key}"])`);
      }

      const prefix = (jsonUnwrapped.prefix != null) ? jsonUnwrapped.prefix : '';
      const suffix = (jsonUnwrapped.suffix != null) ? jsonUnwrapped.suffix : '';

      const objStringified = this.transform(key, obj[key], newContext, new Map(valueAlreadySeen));
      const keys = Object.keys(objStringified);
      for (const oldKey of keys) {
        const newKey = prefix + oldKey + suffix;
        replacement[newKey] = objStringified[oldKey];
      }

      delete replacement[key];
    }
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param context
   */
  private stringifyJsonIdentityInfo(replacement: any, obj: any, context: JsonStringifierTransformerContext): void {
    const currentMainCreator = context.mainCreator[0];

    const jsonIdentityInfo: JsonIdentityInfoOptions =
      getMetadata('jackson:JsonIdentityInfo', currentMainCreator, null, context);

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
            if (!Object.hasOwnProperty.call(replacement, jsonIdentityInfo.property)) {
              // eslint-disable-next-line max-len
              throw new JacksonError(`Invalid Object Id definition for "${currentMainCreator.name}": cannot find property with name "${jsonIdentityInfo.property}"`);
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
        const objIdentifier = (typeof replacement[jsonIdentityInfo.property] === 'function') ?
          replacement[jsonIdentityInfo.property]() :
          replacement[jsonIdentityInfo.property];
        this._globalValueAlreadySeen.set(obj, objIdentifier);
      }
    }
  }

  /**
   *
   * @param obj
   * @param context
   */
  private hasJsonIdentityReferenceAlwaysAsId(obj: any, context: JsonStringifierTransformerContext): boolean {
    const currentMainCreator = context.mainCreator[0];

    const jsonIdentityInfo: JsonIdentityInfoOptions =
      getMetadata('jackson:JsonIdentityInfo', currentMainCreator, null, context);
    const jsonIdentityReference: JsonIdentityReferenceOptions =
      getMetadata('jackson:JsonIdentityReference', currentMainCreator, null, context);
    return jsonIdentityReference != null && jsonIdentityReference.alwaysAsId && jsonIdentityInfo != null;
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param context
   */
  private stringifyJsonIdentityReference(replacement: any, obj: any, context: JsonStringifierTransformerContext): any {
    const jsonIdentityInfo: JsonIdentityInfoOptions =
      getMetadata('jackson:JsonIdentityInfo', context.mainCreator[0], null, context);
    return replacement[jsonIdentityInfo.property];
  }

  /**
   *
   * @param key
   * @param iterableNoString
   * @param context
   * @param valueAlreadySeen
   */
  private stringifyIterable(key: string, iterableNoString: any,
                            context: JsonStringifierTransformerContext, valueAlreadySeen: Map<any, any>): any[] {
    const iterable = [...iterableNoString];
    const newIterable = [];
    for (const value of iterable) {
      const newContext = cloneDeep(context);
      let newMainCreator;
      if (context.mainCreator.length > 1) {
        newMainCreator = newContext.mainCreator[1];
      } else {
        newMainCreator = [Object];
      }
      if (value != null && value.constructor !== Object) {
        newMainCreator[0] = value.constructor;
      }
      newContext.mainCreator = newMainCreator;
      (newIterable).push(this.transform(key, value, newContext, new Map(valueAlreadySeen)));
    }
    return newIterable;
  }

  /**
   *
   * @param map
   * @param context
   */
  private stringifyMap(map: Map<any, any>, context: JsonStringifierTransformerContext): any {
    const newValue = {};
    for (const [k, val] of map) {
      newValue[k.toString()] = val;
    }
    return newValue;
  }

  /**
   *
   * @param filter
   * @param obj
   * @param key
   * @param context
   */
  private isPropertyKeyExcludedByJsonFilter(filter: JsonStringifierFilterOptions,
                                            obj: any, key: string,
                                            context: JsonStringifierTransformerContext): boolean {
    if (filter.values == null) {
      return false;
    }
    const jsonProperty: JsonPropertyOptions =
      getMetadata('jackson:JsonProperty', context.mainCreator[0], key, context);
    switch (filter.type) {
    case JsonFilterType.FILTER_OUT_ALL_EXCEPT:
      return !filter.values.includes(key) && !(jsonProperty && filter.values.includes(jsonProperty.value));
    case JsonFilterType.SERIALIZE_ALL:
      return false;
    case JsonFilterType.SERIALIZE_ALL_EXCEPT:
      return filter.values.includes(key) || (jsonProperty && filter.values.includes(jsonProperty.value));
    }
  }

  /**
   *
   * @param obj
   * @param key
   * @param context
   */
  private stringifyIsPropertyKeyExcludedByJsonFilter(obj: any, key: string, context: JsonStringifierTransformerContext): boolean {
    const jsonFilter: JsonFilterOptions =
      getMetadata('jackson:JsonFilter', context.mainCreator[0], null, context);
    if (jsonFilter) {
      const filter = context.filters[jsonFilter.value];
      if (filter) {
        return this.isPropertyKeyExcludedByJsonFilter(filter, obj, key, context);
      }
    }
    return false;
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param oldKey
   * @param newKey
   * @param context
   */
  private stringifyJsonFilter(replacement: any, obj: any, oldKey: string, newKey: string, context: JsonStringifierTransformerContext) {
    const currentMainCreator = context.mainCreator[0];
    const jsonFilter: JsonFilterOptions = getMetadata('jackson:JsonFilter', currentMainCreator, oldKey, context);
    if (jsonFilter) {
      const filter = context.filters[jsonFilter.value];
      if (filter) {
        replacement[newKey] = clone(obj[oldKey]);
        // eslint-disable-next-line guard-for-in
        for (const propertyKey in obj[oldKey]) {

          const newContext = cloneDeep(context);
          let newMainCreator;
          const jsonClass: JsonClassOptions = getMetadata('jackson:JsonClass', currentMainCreator, oldKey, context);
          if (jsonClass && jsonClass.class) {
            newMainCreator = jsonClass.class();
          } else {
            newMainCreator = [Object];
          }
          if (obj[oldKey] != null && obj[oldKey].constructor !== Object) {
            newMainCreator[0] = obj[oldKey].constructor;
          }
          newContext.mainCreator = newMainCreator;

          const isExcluded = this.isPropertyKeyExcludedByJsonFilter(filter, obj[oldKey], propertyKey, newContext);
          if (isExcluded) {
            delete replacement[newKey][propertyKey];
          }
        }
      }
    }
  }

  /**
   *
   * @param obj
   * @param context
   */
  private isPrependJsonAppend(obj: any, context: JsonStringifierTransformerContext) {
    const jsonAppend: JsonAppendOptions =
      getMetadata('jackson:JsonAppend', context.mainCreator[0], null, context);
    return jsonAppend && jsonAppend.prepend;
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param context
   */
  private stringifyJsonAppend(replacement: any, obj: any, context: JsonStringifierTransformerContext) {
    const currentMainCreator = context.mainCreator[0];

    const jsonAppend: JsonAppendOptions =
      getMetadata('jackson:JsonAppend', currentMainCreator, null, context);
    if (jsonAppend) {
      for (const attr of jsonAppend.attrs) {
        const attributeKey = attr.value;
        if (attributeKey != null) {
          if (attr.required && !Object.hasOwnProperty.call(context.attributes, attributeKey)) {
            // eslint-disable-next-line max-len
            throw new JacksonError(`Missing @JsonAppend() required attribute "${attributeKey}" for class "${currentMainCreator.name}".`);
          }

          const value = context.attributes[attributeKey];
          const key = attr.propName ? attr.propName : attributeKey;

          switch (attr.include) {
          case JsonIncludeType.NON_EMPTY:
            if (isValueEmpty(value)) {
              continue;
            }
            break;
          case JsonIncludeType.NON_NULL:
            if (value == null) {
              continue;
            }
            break;
          case JsonIncludeType.NON_DEFAULT:
            if (value === getDefaultValue(value) || isValueEmpty(value)) {
              continue;
            }
            break;
          }
          replacement[key] = value;
        }
      }
    }
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param key
   * @param context
   */
  private stringifyJsonNaming(replacement: any, obj: any, key: string, context: JsonStringifierTransformerContext): string {
    const jsonNamingOptions: JsonNamingOptions = getMetadata('jackson:JsonNaming', context.mainCreator[0], null, context);
    if (jsonNamingOptions && jsonNamingOptions.strategy != null) {
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
      return newKey;
    }
    return key;
  }
}
