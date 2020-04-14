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
  JsonViewOptions
} from '../@types';
import {JsonPropertyAccess} from '../decorators/JsonProperty';
import {JsonIncludeType} from '../decorators/JsonInclude';
import {
  classHasOwnProperty, classPropertiesToVirtualPropertiesMapping,
  getClassProperties,
  getDeepestClass,
  getDefaultPrimitiveTypeValue,
  getDefaultValue,
  getMetadata,
  hasMetadata,
  isConstructorPrimitiveType,
  isIterableNoMapNoString,
  isObjLiteral,
  isSameConstructor,
  isSameConstructorOrExtensionOf,
  isValueEmpty,
  isVariablePrimitiveType, mapVirtualPropertiesToClassProperties
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
  JsonGetterPrivateOptions, JsonPropertyPrivateOptions,
  JsonTypeIdPrivateOptions,
  JsonTypeNamePrivateOptions, JsonUnwrappedPrivateOptions,
  JsonValuePrivateOptions
} from '../@types/private';
import {PropertyNamingStrategy} from '../decorators/JsonNaming';
import {JsonFilterType} from '../decorators/JsonFilter';
import * as cloneDeep from 'lodash.clonedeep';
import * as clone from 'lodash.clone';
import {MapperFeature} from '../databind/MapperFeature';

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
    const newContext: JsonStringifierTransformerContext = this.convertStringifierContextToTransformerContext(context);
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
  transform(key: string, value: any,
            context: JsonStringifierTransformerContext = {},
            valueAlreadySeen: Map<any, any> = new Map<any, any>()): any {
    context.mainCreator = (context.mainCreator && context.mainCreator[0] !== Object) ?
      context.mainCreator : [(value != null) ? (value.constructor as ObjectConstructor) : Object];
    context._propertyParentCreator = context.mainCreator[0];
    context = cloneDeep(context);
    const preProcessedObj = this.deepTransform('', value, context, new Map());
    return preProcessedObj;
  }
  /**
   *
   * @param key
   * @param value
   * @param context
   * @param valueAlreadySeen: Map used to manage object circular references
   */
  deepTransform(key: string, value: any, context: JsonStringifierTransformerContext, valueAlreadySeen: Map<any, any>): any {
    context = {
      features: {
        mapper: [],
        serialization: []
      },
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
    value = this.stringifyJsonSerializeClass(key, value, context);

    if (value == null && isConstructorPrimitiveType(context.mainCreator[0])) {
      value = this.getDefaultValue(context);
    }

    if (value != null && value.constructor === Number && isNaN(value) && context.features.serialization[SerializationFeature.WRITE_NAN_AS_ZERO]) {
      value = 0;
    } else if (value === Infinity) {
      if (context.features.serialization[SerializationFeature.WRITE_POSITIVE_INFINITY_AS_NUMBER_MAX_SAFE_INTEGER]) {
        value = Number.MAX_SAFE_INTEGER;
      } else if (context.features.serialization[SerializationFeature.WRITE_POSITIVE_INFINITY_AS_NUMBER_MAX_VALUE]) {
        value = Number.MAX_VALUE;
      }
    } else if (value === -Infinity) {
      if (context.features.serialization[SerializationFeature.WRITE_NEGATIVE_INFINITY_AS_NUMBER_MIN_SAFE_INTEGER]) {
        value = Number.MIN_SAFE_INTEGER;
      } else if (context.features.serialization[SerializationFeature.WRITE_NEGATIVE_INFINITY_AS_NUMBER_MIN_VALUE]) {
        value = Number.MIN_VALUE;
      }
    } else if (value != null && value instanceof Date &&
      context.features.serialization[SerializationFeature.WRITE_DATES_AS_TIMESTAMPS]) {
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

        const jsonValueOptions: JsonValuePrivateOptions = getMetadata('jackson:JsonValue', context.mainCreator[0], null, context);
        if (jsonValueOptions) {
          const jsonValue = this.stringifyJsonValue(value, context);
          const newContext: JsonStringifierTransformerContext = cloneDeep(context);

          let newMainCreator;
          const jsonClass: JsonClassOptions =
            getMetadata('jackson:JsonClass', currentMainCreator, jsonValueOptions.propertyKey, context);
          if (jsonClass && jsonClass.class) {
            newMainCreator = jsonClass.class();
          } else {
            newMainCreator = [Object];
          }
          if (jsonValue != null && jsonValue.constructor !== Object) {
            newMainCreator[0] = jsonValue.constructor;
          }

          newContext.mainCreator = newMainCreator;
          newContext._propertyParentCreator = newContext.mainCreator[0];
          replacement = this.deepTransform(key, jsonValue, newContext, new Map(valueAlreadySeen));
          return replacement;
        }

        const isPrepJsonAppend = this.isPrependJsonAppend(value, context);
        if (isPrepJsonAppend) {
          this.stringifyJsonAppend(replacement, value, context);
        }

        let keys = getClassProperties(currentMainCreator, value, {
          withGettersAsProperty: true
        });

        keys = this.stringifyJsonPropertyOrder(keys, context);

        const namingMap = new Map<string, string>();

        for (const k of keys) {
          if (!this.stringifyHasJsonIgnore(value, k, context) &&
            this.stringifyHasJsonView(value, k, context) &&
            !this.stringifyIsIgnoredByJsonPropertyAccess(k, context) &&
            !this.stringifyHasJsonBackReference(value, k, context) &&
            !this.stringifyIsPropertyKeyExcludedByJsonFilter(value, k, context) &&
            classHasOwnProperty(currentMainCreator, k, value, {withGettersAsProperty: true})) {

            let newKey = this.stringifyJsonNaming(replacement, value, k, context);
            namingMap.set(k, newKey);

            // if it has a JsonIdentityReference, then we can skip all these methods because
            // the entire object will be replaced later by the identity value
            if (!this.hasJsonIdentityReferenceAlwaysAsId(value, context)) {

              if (value === value[k] && context.features.serialization[SerializationFeature.FAIL_ON_SELF_REFERENCES]) {
                // eslint-disable-next-line max-len
                throw new JacksonError(`Direct self-reference leading to cycle (through reference chain: ${currentMainCreator.name}["${k}"])`);
              }

              this.propagateDecorators(value, k, context);

              replacement[newKey] = this.stringifyJsonGetter(value, k, context);
              if (!this.stringifyJsonInclude(replacement, newKey, context)) {
                namingMap.delete(k);
                delete replacement[newKey];
                continue;
              }

              if (replacement[newKey] == null) {
                this.stringifyJsonSerializePropertyNull(replacement, k, newKey, context);
              }

              if (replacement[newKey] != null) {
                if (replacement[newKey] instanceof Map || isObjLiteral(replacement[newKey])) {
                  this.stringifyJsonSerializeMap(replacement, k, newKey, context);
                }
                this.stringifyJsonSerializeProperty(replacement, value, k, newKey, context);
                if (replacement[newKey] instanceof Map || isObjLiteral(replacement[newKey])) {
                  this.stringifyJsonIncludeMap(replacement, k, newKey, context);
                }
                replacement[newKey] = this.stringifyJsonFormatProperty(replacement, value, k, newKey, context);
                this.stringifyJsonRawValue(replacement, value, k, newKey, context);
                this.stringifyJsonFilter(replacement, value, k, newKey, context);
                newKey = this.stringifyJsonVirtualProperty(replacement, value, k, newKey, context, namingMap);
                if (!isIterableNoMapNoString(replacement[newKey])) {
                  this.stringifyJsonUnwrapped(replacement, value, k, newKey, context, valueAlreadySeen);
                }
              }
            } else {
              replacement[newKey] = this.stringifyJsonGetter(value, k, context);
              if (!this.stringifyJsonInclude(replacement, newKey, context)) {
                namingMap.delete(k);
                delete replacement[newKey];
                continue;
              }

              if (replacement[newKey] == null) {
                this.stringifyJsonSerializePropertyNull(replacement, k, newKey, context);
              }
            }
          }
        }

        this.stringifyJsonAnyGetter(replacement, value, context);

        if (!isPrepJsonAppend) {
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
            newContext._propertyParentCreator = currentMainCreator;

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
            replacement[k] = this.deepTransform(oldKey, replacement[k], newContext, new Map(valueAlreadySeen));
          }

          replacement = this.stringifyJsonRootName(replacement, value, context);
          replacement = this.stringifyJsonTypeInfo(replacement, value, context);
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
  private convertStringifierContextToTransformerContext(context: JsonStringifierContext): JsonStringifierTransformerContext {
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
      (context.features.mapper[MapperFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        context.features.mapper[MapperFeature.SET_DEFAULT_VALUE_FOR_STRING_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(String);
    } else if (currentMainCreator === Number &&
      (context.features.mapper[MapperFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        context.features.mapper[MapperFeature.SET_DEFAULT_VALUE_FOR_NUMBER_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(Number);
    } else if (currentMainCreator === Boolean &&
      (context.features.mapper[MapperFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        context.features.mapper[MapperFeature.SET_DEFAULT_VALUE_FOR_BOOLEAN_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(Boolean);
    } else if (BigInt && currentMainCreator === BigInt &&
      (context.features.mapper[MapperFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        context.features.mapper[MapperFeature.SET_DEFAULT_VALUE_FOR_BIGINT_ON_NULL]) ) {
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
      'jackson:JsonIdentityReference',
      'jackson:JsonPropertyOrder'
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

    const jsonVirtualProperty: JsonPropertyPrivateOptions | JsonGetterPrivateOptions =
      getMetadata('jackson:JsonVirtualProperty:' + key, currentMainCreator, null, context);

    const jsonIgnoreProperties: JsonIgnorePropertiesOptions =
      getMetadata('jackson:JsonIgnoreProperties', currentMainCreator, null, context);
    if (jsonVirtualProperty &&
      !(jsonIgnoreProperties && !jsonIgnoreProperties.allowGetters && jsonIgnoreProperties.value.includes(jsonVirtualProperty.value)) ) {
      return (jsonVirtualProperty.descriptor != null && typeof jsonVirtualProperty.descriptor.value === 'function') ?
        obj[key]() : obj[key];
    }
    return obj[key];
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param context
   */
  private stringifyJsonAnyGetter(replacement: any, obj: any, context: JsonStringifierTransformerContext): void {
    const currentMainCreator = context.mainCreator[0];

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
        }
      } else {
        for (const k in map) {
          if (Object.hasOwnProperty.call(map, k)) {
            replacement[k] = map[k];
          }
        }
      }

      if (jsonAnyGetter.value) {
        delete replacement[jsonAnyGetter.value];
      }
    }
  }

  /**
   *
   * @param keys
   * @param context
   */
  private stringifyJsonPropertyOrder(keys: string[], context: JsonStringifierTransformerContext): string[] {
    const currentMainCreator = context.mainCreator[0];

    const jsonPropertyOrder: JsonPropertyOrderOptions =
      getMetadata('jackson:JsonPropertyOrder', currentMainCreator, null, context);
    if (jsonPropertyOrder) {
      const classProperties =
        mapVirtualPropertiesToClassProperties(currentMainCreator, jsonPropertyOrder.value, {checkGetters: true});

      let remainingKeys = keys.filter(key => !classProperties.includes(key));

      if (jsonPropertyOrder.alphabetic) {
        const remainingKeysToVirtualPropertiesMapping =
          classPropertiesToVirtualPropertiesMapping(currentMainCreator, remainingKeys);
        const remainingVirtualKeysOrdered = new Map(
          [...remainingKeysToVirtualPropertiesMapping.entries()]
            .sort((a, b) => a[1] > b[1] ? 1 : -1)
        );
        const remainingKeysOrdered = [];
        for (const [classProperty, virtualProperty] of remainingVirtualKeysOrdered) {
          remainingKeysOrdered.push(classProperty);
        }
        remainingKeys = remainingKeysOrdered;
      }

      keys = classProperties.concat(remainingKeys);
    }
    return keys;
  }

  /**
   *
   * @param oldKey
   * @param context
   */
  private stringifyIsIgnoredByJsonPropertyAccess(oldKey: string, context: JsonStringifierTransformerContext): boolean {
    const jsonProperty: JsonPropertyOptions = getMetadata('jackson:JsonProperty', context.mainCreator[0], oldKey, context);
    if (jsonProperty) {
      return jsonProperty.access === JsonPropertyAccess.WRITE_ONLY;
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
   * @param namingMap
   */
  private stringifyJsonVirtualProperty(replacement: any, obj: any, oldKey: string, newKey: string,
                                       context: JsonStringifierTransformerContext, namingMap: Map<string, string>): string {
    const jsonVirtualProperty: JsonPropertyPrivateOptions | JsonGetterPrivateOptions =
      getMetadata('jackson:JsonVirtualProperty:' + oldKey, context.mainCreator[0], null, context);

    if (jsonVirtualProperty && jsonVirtualProperty.value !== oldKey) {
      const newKeyUpdated = this.stringifyJsonNaming(replacement, obj, jsonVirtualProperty.value, context);
      namingMap.set(oldKey, newKeyUpdated);

      replacement[newKeyUpdated] = replacement[newKey];
      delete replacement[newKey];

      return newKeyUpdated;
    }

    return newKey;
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
  private stringifyJsonSerializeClass(key: string, obj: any, context: JsonStringifierTransformerContext): any {
    const jsonSerialize: JsonSerializeOptions =
      getMetadata('jackson:JsonSerialize', context.mainCreator[0], null, context);
    if (jsonSerialize && jsonSerialize.using) {
      return jsonSerialize.using(obj, context);
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
      replacement[newKey] = jsonSerialize.using(replacement[newKey], context);
    }
  }

  /**
   *
   * @param replacement
   * @param oldKey
   * @param newKey
   * @param context
   */
  private stringifyJsonSerializePropertyNull(replacement: any, oldKey: string, newKey: string,
                                             context: JsonStringifierTransformerContext): void {
    const jsonSerialize: JsonSerializeOptions = getMetadata('jackson:JsonSerialize', context.mainCreator[0], oldKey, context);
    if (jsonSerialize && jsonSerialize.nullsUsing) {
      replacement[newKey] = jsonSerialize.nullsUsing(context);
    }
  }

  /**
   *
   * @param replacement
   * @param oldKey
   * @param newKey
   * @param context
   */
  private stringifyJsonSerializeMap(replacement: any, oldKey: string, newKey: string, context: JsonStringifierTransformerContext): void {
    const jsonSerialize: JsonSerializeOptions = getMetadata('jackson:JsonSerialize', context.mainCreator[0], oldKey, context);
    if (jsonSerialize && (jsonSerialize.contentUsing || jsonSerialize.keyUsing)) {
      const mapIterable =
        (replacement[newKey] instanceof Map) ?
          [...replacement[newKey].entries()] :
          Object.entries(replacement[newKey]);

      for (const [mapKey, mapValue] of mapIterable) {
        const newMapKey = (jsonSerialize.keyUsing) ? jsonSerialize.keyUsing(mapKey, context) : mapKey;
        const newMapValue = (jsonSerialize.contentUsing) ?
          jsonSerialize.contentUsing(mapValue, context) : mapValue;

        if (replacement[newKey] instanceof Map) {
          if (mapKey !== newMapKey) {
            (replacement[newKey] as Map<any, any>).delete(mapKey);
          }
          (replacement[newKey] as Map<any, any>).set(newMapKey, newMapValue);
        } else {
          if (mapKey !== newMapKey) {
            delete replacement[newKey][mapKey];
          }
          replacement[newKey][newMapKey] = newMapValue;
        }
      }
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
        const jsonVirtualProperty: JsonPropertyPrivateOptions | JsonGetterPrivateOptions =
          getMetadata('jackson:JsonVirtualProperty:' + key, currentMainCreator, null, context);

        if (jsonVirtualProperty && jsonIgnoreProperties.value.includes(jsonVirtualProperty.value)) {
          if (jsonVirtualProperty.descriptor != null && typeof jsonVirtualProperty.descriptor.value === 'function' &&
            jsonIgnoreProperties.allowGetters) {
            return false;
          }
          return true;
        }
        return jsonIgnoreProperties.value.includes(key);
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
    const currentMainCreator = context.mainCreator[0];

    if (context.withViews) {
      let jsonView: JsonViewOptions =
        getMetadata('jackson:JsonView', currentMainCreator, key, context);
      if (!jsonView) {
        jsonView = getMetadata('jackson:JsonView', currentMainCreator, null, context);
      }

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
  private stringifyJsonUnwrapped(replacement: any, obj: any, oldKey: string, newKey: string,
                                 context: JsonStringifierTransformerContext, valueAlreadySeen: Map<any, any>): void {
    const currentMainCreator = context.mainCreator[0];
    const jsonUnwrapped: JsonUnwrappedPrivateOptions = getMetadata('jackson:JsonUnwrapped', currentMainCreator, oldKey, context);

    if (jsonUnwrapped) {
      const objValue = (typeof obj[oldKey] === 'function') ? obj[oldKey]() : obj[oldKey];
      const newContext = cloneDeep(context);
      let newMainCreator;
      const jsonClass: JsonClassOptions = getMetadata('jackson:JsonClass', currentMainCreator, oldKey, context);
      if (jsonClass && jsonClass.class) {
        newMainCreator = jsonClass.class();
      } else {
        newMainCreator = [Object];
      }
      if (obj[oldKey] != null && objValue.constructor !== Object) {
        newMainCreator[0] = objValue.constructor;
      }
      newContext.mainCreator = newMainCreator;

      const hasJsonTypeInfo = (typeof objValue === 'object') ?
        hasMetadata('jackson:JsonTypeInfo', newContext.mainCreator, null, newContext) : false;
      if (hasJsonTypeInfo) {
        // eslint-disable-next-line max-len
        throw new JacksonError(`Unwrapped property requires use of type information: cannot serialize (through reference chain: ${currentMainCreator.name}["${oldKey}"])`);
      }

      const prefix = (jsonUnwrapped.prefix != null) ? jsonUnwrapped.prefix : '';
      const suffix = (jsonUnwrapped.suffix != null) ? jsonUnwrapped.suffix : '';

      const objTransformed = this.deepTransform(oldKey, objValue, newContext, new Map(valueAlreadySeen));
      const keys = Object.keys(objTransformed);

      for (const objKey of keys) {
        const newKeyWrapped = prefix + objKey + suffix;
        replacement[newKeyWrapped] = objTransformed[objKey];
      }

      delete replacement[newKey];
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
    const jsonSerialize: JsonSerializeOptions =
      getMetadata('jackson:JsonSerialize',
        context._propertyParentCreator,
        key, context);

    const iterable = [...iterableNoString];
    const newIterable = [];
    for (let value of iterable) {
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

      if (jsonSerialize && jsonSerialize.contentUsing) {
        value = jsonSerialize.contentUsing(value, newContext);
      }

      newIterable.push(this.deepTransform(key, value, newContext, new Map(valueAlreadySeen)));
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
    let mapKeys = [...map.keys()];
    if (context.features.serialization[SerializationFeature.ORDER_MAP_ENTRIES_BY_KEYS]) {
      mapKeys = mapKeys.sort();
    }
    for (const mapKey of mapKeys) {
      newValue[mapKey.toString()] = map.get(mapKey);
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
        replacement[newKey] = clone(
          (typeof obj[oldKey] === 'function') ? obj[oldKey]() : obj[oldKey]
        );
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
        case PropertyNamingStrategy.KEBAB_CASE:
          token = token.toLowerCase();
          separator = '-';
          break;
        case PropertyNamingStrategy.LOWER_CAMEL_CASE:
          if (i === 0) {
            token = token.toLowerCase();
          } else {
            token = token.charAt(0).toUpperCase() + token.slice(1);
          }
          break;
        case PropertyNamingStrategy.LOWER_CASE:
          token = token.toLowerCase();
          break;
        case PropertyNamingStrategy.LOWER_DOT_CASE:
          token = token.toLowerCase();
          separator = '.';
          break;
        case PropertyNamingStrategy.SNAKE_CASE:
          token = token.toLowerCase();
          separator = (i > 0 && tokens[i - 1].endsWith('_')) ? '' : '_';
          break;
        case PropertyNamingStrategy.UPPER_CAMEL_CASE:
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
