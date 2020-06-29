/**
 * @packageDocumentation
 * @module Core
 */

import {
  ClassType,
  JsonAppendOptions,
  JsonClassTypeOptions,
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
  JsonViewOptions,
  InternalDecorators,
  JsonValueOptions,
  JsonUnwrappedOptions,
  JsonGetterOptions,
  JsonAnyGetterOptions,
  JsonTypeIdOptions,
  JsonTypeNameOptions, ClassList
} from '../@types';
import {
  JsonPropertyAccess,
  JsonIncludeType,
  JsonTypeInfoAs,
  JsonTypeInfoId,
  JsonFormatShape,
  ObjectIdGenerator,
  PropertyNamingStrategy,
  JsonFilterType
} from '../decorators';
import {
  castObjLiteral,
  classHasOwnProperty,
  classPropertiesToVirtualPropertiesMapping,
  getClassProperties,
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
  isSameConstructorOrExtensionOfNoObject,
  isValueEmpty,
  isVariablePrimitiveType,
  makeMetadataKeysWithContext,
  mapVirtualPropertiesToClassProperties,
  sortMappersByOrder
} from '../util';
// import * as moment from 'moment';
// import {v1 as uuidv1, v3 as uuidv3, v4 as uuidv4, v5 as uuidv5} from 'uuid';
import {JacksonError} from './JacksonError';
import * as cloneDeep from 'lodash.clonedeep';
import * as clone from 'lodash.clone';
import {DefaultSerializationFeatureValues} from '../databind';

/**
 * Json Stringifier Global Context used by {@link JsonStringifier.transform} to store global information.
 */
interface JsonStringifierGlobalContext {
  /**
   * WeakMap used to track all objects by {@link JsonIdentityInfo}.
   */
  globalValueAlreadySeen: WeakMap<any, any>;
  /**
   * Integer sequence generator counter used by {@link JsonIdentityInfo}.
   */
  intSequenceGenerator: number;
}

/**
 * JsonStringifier provides functionality for writing JSON.
 * It is also highly customizable to work both with different styles of JSON content,
 * and to support more advanced Object concepts such as polymorphism and Object identity.
 */
export class JsonStringifier<T> {
  /**
   * Default context to use during serialization.
   */
  defaultContext: JsonStringifierContext;

  /**
   *
   * @param defaultContext - Default context to use during serialization.
   */
  constructor(defaultContext: JsonStringifierContext = JsonStringifier.makeDefaultContext()) {
    this.defaultContext = defaultContext;
  }

  /**
   * Make a default {@link JsonStringifierContext}.
   */
  static makeDefaultContext(): JsonStringifierContext {
    return {
      mainCreator: null,
      features: {
        serialization: {
          ...DefaultSerializationFeatureValues
        }
      },
      serializers: [],
      decoratorsEnabled: {},
      withViews: null,
      forType: new Map(),
      withContextGroups: [],
      _internalDecorators: new Map(),
      _propertyParentCreator: null,
      attributes: {},
      filters: {},
      format: null,
      dateLibrary: null,
      uuidLibrary: null
    };
  }

  /**
   * Merge multiple {@link JsonStringifierContext} into one.
   * Array direct properties will be concatenated, instead, Map and Object Literal direct properties will be merged.
   * All the other properties, such as {@link JsonStringifierContext.mainCreator}, will be completely replaced.
   *
   * @param contexts - list of contexts to be merged.
   */
  static mergeContexts(contexts: JsonStringifierContext[]): JsonStringifierContext {
    const finalContext = JsonStringifier.makeDefaultContext();
    for (const context of contexts) {
      if (context == null) {
        continue;
      }
      if (context.mainCreator != null) {
        finalContext.mainCreator = context.mainCreator;
      }
      if (context.decoratorsEnabled != null) {
        finalContext.decoratorsEnabled = {
          ...finalContext.decoratorsEnabled,
          ...context.decoratorsEnabled
        };
      }
      if (context.withViews != null) {
        finalContext.withViews = context.withViews;
      }
      if (context.withContextGroups != null) {
        finalContext.withContextGroups = finalContext.withContextGroups.concat(context.withContextGroups);
      }
      if (context.serializers != null) {
        finalContext.serializers = finalContext.serializers.concat(context.serializers);
      }
      if (context.features != null && context.features.serialization != null) {
        finalContext.features.serialization = {
          ...finalContext.features.serialization,
          ...context.features.serialization
        };
      }
      if (context.filters != null) {
        finalContext.filters = {
          ...finalContext.filters,
          ...context.filters
        };
      }
      if (context.attributes != null) {
        finalContext.attributes = {
          ...finalContext.attributes,
          ...context.attributes
        };
      }
      if (context.format != null) {
        finalContext.format = context.format;
      }
      if (context.forType != null) {
        finalContext.forType = new Map([
          ...finalContext.forType,
          ...context.forType]
        );
      }
      if (context.dateLibrary != null) {
        finalContext.dateLibrary = context.dateLibrary;
      }
      if (context.uuidLibrary != null) {
        finalContext.uuidLibrary = context.uuidLibrary;
      }
      if (context._internalDecorators != null) {
        finalContext._internalDecorators = new Map([
          ...finalContext._internalDecorators,
          ...context._internalDecorators]
        );
      }
      if (context._propertyParentCreator != null) {
        finalContext._propertyParentCreator = context._propertyParentCreator;
      }
    }
    finalContext.serializers = sortMappersByOrder(finalContext.serializers);
    return finalContext;
  }

  /**
   * Method for serializing a JavaScript object or a value to a JSON string.
   *
   * @param obj - the JavaScript object or value to be serialized.
   * @param context - the context to be used during serialization.
   */
  stringify(obj: T, context?: JsonStringifierContext): string {
    const preProcessedObj = this.transform(obj, context);
    return JSON.stringify(preProcessedObj, null, context.format);
  }

  /**
   * Method for applying json decorators to a JavaScript object/value.
   * It returns a JavaScript object/value with json decorators applied and ready to be JSON serialized.
   *
   * @param value - the JavaScript object or value to be preprocessed.
   * @param context - the context to be used during serialization preprocessing.
   */
  transform(value: any, context?: JsonStringifierContext): any {
    const globalContext: JsonStringifierGlobalContext = {
      globalValueAlreadySeen: new WeakMap<any, any>(),
      intSequenceGenerator: 1
    };

    context = JsonStringifier.mergeContexts([this.defaultContext, context]);

    let newContext: JsonStringifierTransformerContext = this.convertStringifierContextToTransformerContext(context);

    newContext.mainCreator = (newContext.mainCreator && newContext.mainCreator[0] !== Object) ?
      newContext.mainCreator : [(value != null) ? (value.constructor as ObjectConstructor) : Object];
    newContext._propertyParentCreator = newContext.mainCreator[0];
    newContext = cloneDeep(newContext);

    const currentMainCreator = newContext.mainCreator[0];
    value = castObjLiteral(currentMainCreator, value);

    const preProcessedObj = this.deepTransform('', value, undefined, newContext, globalContext, new Map<any, any>());
    return preProcessedObj;
  }

  /**
   * Recursive {@link JsonStringifier.transform}.
   *
   * @param key - key name representing the object property being preprocessed.
   * @param value - the JavaScript object or value to preprocessed.
   * @param parent - the parent object of value (if available).
   * @param context - the context to be used during serialization preprocessing.
   * @param globalContext - the global context to be used during serialization preprocessing.
   * @param valueAlreadySeen - Map used to manage object circular references.
   */
  private deepTransform(key: string, value: any, parent: any,
                        context: JsonStringifierTransformerContext, globalContext: JsonStringifierGlobalContext,
                        valueAlreadySeen: Map<any, any>): any {
    context = {
      withContextGroups: [],
      features: {
        serialization: {}
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

    const currentMainCreator = context.mainCreator[0];

    value = this.invokeCustomSerializers(key, value, context);
    value = this.stringifyJsonSerializeClass(value, context);

    if (value == null && isConstructorPrimitiveType(context.mainCreator[0])) {
      value = this.getDefaultValue(context);
    }

    if (value != null && value.constructor === Number && isNaN(value as number) && context.features.serialization.WRITE_NAN_AS_ZERO) {
      value = 0;
    } else if (value === Infinity) {
      if (context.features.serialization.WRITE_POSITIVE_INFINITY_AS_NUMBER_MAX_SAFE_INTEGER) {
        value = Number.MAX_SAFE_INTEGER;
      } else if (context.features.serialization.WRITE_POSITIVE_INFINITY_AS_NUMBER_MAX_VALUE) {
        value = Number.MAX_VALUE;
      }
    } else if (value === -Infinity) {
      if (context.features.serialization.WRITE_NEGATIVE_INFINITY_AS_NUMBER_MIN_SAFE_INTEGER) {
        value = Number.MIN_SAFE_INTEGER;
      } else if (context.features.serialization.WRITE_NEGATIVE_INFINITY_AS_NUMBER_MIN_VALUE) {
        value = Number.MIN_VALUE;
      }
    } else if (value != null && value instanceof Date &&
      context.features.serialization.WRITE_DATES_AS_TIMESTAMPS) {
      value = value.getTime();
    }

    if (value != null) {

      const identity = globalContext.globalValueAlreadySeen.get(value);
      if (identity) {
        return identity;
      }

      value = this.stringifyJsonFormatClass(value, context);

      if (BigInt && isSameConstructorOrExtensionOfNoObject(value.constructor, BigInt)) {
        return value.toString() + 'n';
      } else if (value instanceof RegExp) {
        const replacement = value.toString();
        return replacement.substring(1, replacement.length - 1);
      } else if (value instanceof Date) {
        return value;
      } else if (value instanceof Map || (isObjLiteral(value) && currentMainCreator === Object)) {
        value = this.stringifyMapAndObjLiteral(key, value, context, globalContext, new Map(valueAlreadySeen));
      } else if (typeof value === 'object' && !isIterableNoMapNoString(value)) {

        // Infinite recursion is already handled by JSON.stringify();
        // if (valueAlreadySeen.has(value)) {
        //   throw new JacksonError(`Infinite recursion on key "${key}" of type "${currentMainCreator.name}"`);
        // }
        valueAlreadySeen.set(value, (identity) ? identity : null);

        let replacement = {};

        const jsonValueOptions: JsonValueOptions = getMetadata('JsonValue', context.mainCreator[0], null, context);
        if (jsonValueOptions) {
          let jsonValue = this.stringifyJsonValue(value, context);
          const newContext: JsonStringifierTransformerContext = cloneDeep(context);

          let newMainCreator;
          const jsonClass: JsonClassTypeOptions =
            getMetadata('JsonClassType', currentMainCreator, jsonValueOptions._propertyKey, context);
          if (jsonClass && jsonClass.type) {
            newMainCreator = jsonClass.type();
          } else {
            newMainCreator = [Object];
          }
          if (jsonValue != null && jsonValue.constructor !== Object) {
            newMainCreator[0] = jsonValue.constructor;
          }

          newContext.mainCreator = newMainCreator;
          newContext._propertyParentCreator = newContext.mainCreator[0];

          jsonValue = castObjLiteral(newContext.mainCreator[0], jsonValue);

          replacement = this.deepTransform(key, jsonValue, parent, newContext, globalContext, new Map(valueAlreadySeen));
          return replacement;
        }

        const isPrepJsonAppend = this.isPrependJsonAppend(context);
        if (isPrepJsonAppend) {
          this.stringifyJsonAppend(replacement, context);
        }

        let keys = getClassProperties(currentMainCreator, value, context, {
          withGettersAsProperty: true
        });

        keys = this.stringifyJsonPropertyOrder(keys, context);

        const namingMap = new Map<string, string>();

        for (const k of keys) {
          if (!this.stringifyHasJsonIgnore(k, context) &&
            this.stringifyHasVirtualPropertyGetter(k, context) &&
            this.stringifyHasJsonView(k, context) &&
            !this.stringifyIsIgnoredByJsonPropertyAccess(k, context) &&
            !this.stringifyHasJsonBackReference(k, context) &&
            !this.stringifyIsPropertyKeyExcludedByJsonFilter(k, context) &&
            classHasOwnProperty(currentMainCreator, k, value, context, {withGettersAsProperty: true})) {

            let newKey = this.stringifyJsonNaming(replacement, k, context);
            namingMap.set(k, newKey);

            // if it has a JsonIdentityReference, then we can skip all these methods because
            // the entire object will be replaced later by the identity value
            if (!this.hasJsonIdentityReferenceAlwaysAsId(context)) {

              const jsonIdentityInfo: JsonIdentityInfoOptions =
                getMetadata('JsonIdentityInfo', currentMainCreator, null, context);
              if (value === value[k] && jsonIdentityInfo == null) {
                if (context.features.serialization.FAIL_ON_SELF_REFERENCES) {
                  // eslint-disable-next-line max-len
                  throw new JacksonError(`Direct self-reference leading to cycle (through reference chain: ${currentMainCreator.name}["${k}"])`);
                }
                if (context.features.serialization.WRITE_SELF_REFERENCES_AS_NULL) {
                  value[k] = null;
                }
              }
              this.propagateDecorators(value, k, context);

              replacement[newKey] = this.stringifyJsonGetter(value, k, context);
              if (this.stringifyHasJsonIgnoreTypeByKey(replacement, newKey, context)) {
                delete replacement[newKey];
                continue;
              }

              if (!this.stringifyJsonInclude(replacement, newKey, context)) {
                namingMap.delete(k);
                delete replacement[newKey];
                continue;
              }

              if (replacement[newKey] == null) {
                this.stringifyJsonSerializePropertyNull(replacement, k, newKey, context);
              }
              this.stringifyJsonSerializeProperty(replacement, k, newKey, context);

              if (replacement[newKey] != null) {
                replacement[newKey] = this.stringifyJsonFormatProperty(replacement, k, newKey, context);
                this.stringifyJsonRawValue(replacement, k, newKey, context);
                this.stringifyJsonFilter(replacement, value, k, newKey, context);
                newKey = this.stringifyJsonVirtualProperty(replacement, k, newKey, context, namingMap);
                if (!isIterableNoMapNoString(replacement[newKey])) {
                  this.stringifyJsonUnwrapped(replacement, value, parent, k, newKey, context, globalContext, new Map(valueAlreadySeen));
                }
              } else {
                newKey = this.stringifyJsonVirtualProperty(replacement, k, newKey, context, namingMap);
              }
            }
          }
        }

        if (this.hasJsonIdentityReferenceAlwaysAsId(context)) {
          replacement = this.stringifyJsonIdentityReference(value, context);
        } else {
          this.stringifyJsonAnyGetter(replacement, value, context);

          if (!isPrepJsonAppend) {
            this.stringifyJsonAppend(replacement, context);
          }

          this.stringifyJsonIdentityInfo(replacement, value, context, globalContext);

          // eslint-disable-next-line guard-for-in
          for (const k in replacement) {
            const oldKey = namingMap.get(k);
            const newContext: JsonStringifierTransformerContext = cloneDeep(context);
            newContext._propertyParentCreator = currentMainCreator;

            let newMainCreator;
            const jsonClass: JsonClassTypeOptions = getMetadata('JsonClassType', currentMainCreator, oldKey, context);
            if (jsonClass && jsonClass.type) {
              newMainCreator = jsonClass.type();
            } else {
              newMainCreator = [Object];
            }
            if (replacement[k] != null && replacement[k].constructor !== Object) {
              newMainCreator[0] = replacement[k].constructor;
            }
            newContext.mainCreator = newMainCreator;

            replacement[k] = castObjLiteral(newContext.mainCreator[0], replacement[k]);

            replacement[k] = this.deepTransform(oldKey, replacement[k], replacement, newContext, globalContext, new Map(valueAlreadySeen));
          }

          replacement = this.stringifyJsonRootName(replacement, context);
          replacement = this.stringifyJsonTypeInfo(replacement, value, parent, context);
        }

        return replacement;
      } else if (isIterableNoMapNoString(value)) {
        const replacement = this.stringifyIterable(key, value, context, globalContext, new Map(valueAlreadySeen));
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
      (context.features.serialization.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL ||
        context.features.serialization.SET_DEFAULT_VALUE_FOR_STRING_ON_NULL) ) {
      defaultValue = getDefaultPrimitiveTypeValue(String);
    } else if (currentMainCreator === Number &&
      (context.features.serialization.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL ||
        context.features.serialization.SET_DEFAULT_VALUE_FOR_NUMBER_ON_NULL) ) {
      defaultValue = getDefaultPrimitiveTypeValue(Number);
    } else if (currentMainCreator === Boolean &&
      (context.features.serialization.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL ||
        context.features.serialization.SET_DEFAULT_VALUE_FOR_BOOLEAN_ON_NULL) ) {
      defaultValue = getDefaultPrimitiveTypeValue(Boolean);
    } else if (BigInt && currentMainCreator === BigInt &&
      (context.features.serialization.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL ||
        context.features.serialization.SET_DEFAULT_VALUE_FOR_BIGINT_ON_NULL) ) {
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
    const jsonClass: JsonClassTypeOptions = getMetadata('JsonClassType', currentMainCreator, key, context);

    // Decorators list that can be propagated
    const metadataKeys = [
      'JsonIgnoreProperties',
      'JsonTypeInfo',
      'JsonSubTypes',
      'JsonTypeIdResolver',
      'JsonFilter',
      'JsonIdentityInfo',
      'JsonIdentityReference',
      'JsonPropertyOrder'
    ];

    const decoratorsNameFound = [];
    const decoratorsToBeApplied: InternalDecorators = {
      depth: 1
    };
    let deepestClass = null;
    if (jsonClass) {
      deepestClass = getDeepestClass(jsonClass.type());
    } else {
      deepestClass = (obj[key] != null) ? obj[key].constructor : Object;
    }

    for (const metadataKey of metadataKeys) {
      const jsonDecoratorOptions: JsonDecoratorOptions = getMetadata(metadataKey, currentMainCreator, key, context);
      if (jsonDecoratorOptions) {
        const metadataKeysWithContext =
          makeMetadataKeysWithContext(metadataKey, {contextGroups: jsonDecoratorOptions.contextGroups});
        for (const metadataKeyWithContext of metadataKeysWithContext) {
          decoratorsToBeApplied[metadataKeyWithContext] = jsonDecoratorOptions;
        }

        decoratorsNameFound.push(metadataKey);
      }
    }

    if (deepestClass != null && decoratorsNameFound.length > 0) {
      context._internalDecorators.set(deepestClass, decoratorsToBeApplied);
    }
  }

  /**
   *
   * @param key
   * @param context
   */
  private stringifyHasVirtualPropertyGetter(key: string, context: JsonStringifierTransformerContext): any {
    const currentMainCreator = context.mainCreator[0];

    const jsonVirtualProperty: JsonPropertyOptions | JsonGetterOptions =
      getMetadata('JsonVirtualProperty:' + key, currentMainCreator, null, context);

    if (jsonVirtualProperty && jsonVirtualProperty._descriptor != null) {
      return typeof jsonVirtualProperty._descriptor.value === 'function' || jsonVirtualProperty._descriptor.get != null ||
        jsonVirtualProperty._descriptor.set == null;
    }
    return true;
  }

  /**
   *
   * @param obj
   * @param key
   * @param context
   */
  private stringifyJsonGetter(obj: any, key: string, context: JsonStringifierTransformerContext): any {
    const currentMainCreator = context.mainCreator[0];

    const jsonVirtualProperty: JsonPropertyOptions | JsonGetterOptions =
      getMetadata('JsonVirtualProperty:' + key, currentMainCreator, null, context);

    const jsonIgnoreProperties: JsonIgnorePropertiesOptions =
      getMetadata('JsonIgnoreProperties', currentMainCreator, null, context);
    if (jsonVirtualProperty &&
      !(jsonIgnoreProperties && !jsonIgnoreProperties.allowGetters && jsonIgnoreProperties.value.includes(jsonVirtualProperty.value)) ) {
      return (jsonVirtualProperty._descriptor != null && typeof jsonVirtualProperty._descriptor.value === 'function') ?
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

    const jsonAnyGetter: JsonAnyGetterOptions = getMetadata('JsonAnyGetter', currentMainCreator, null, context);
    if (jsonAnyGetter && obj[jsonAnyGetter._propertyKey]) {
      const map = (typeof obj[jsonAnyGetter._propertyKey] === 'function') ?
        obj[jsonAnyGetter._propertyKey]() :
        obj[jsonAnyGetter._propertyKey];

      if (!(map instanceof Map) && !isObjLiteral(map)) {
        // eslint-disable-next-line max-len
        throw new JacksonError(`Property ${currentMainCreator.name}["${jsonAnyGetter._propertyKey}"] decorated with @JsonAnyGetter() returned a "${map.constructor.name}": expected "Map" or "Object Literal".`);
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
      getMetadata('JsonPropertyOrder', currentMainCreator, null, context);
    if (context.features.serialization.SORT_PROPERTIES_ALPHABETICALLY || jsonPropertyOrder) {
      const classProperties = (jsonPropertyOrder) ?
        mapVirtualPropertiesToClassProperties(currentMainCreator, jsonPropertyOrder.value, context, {checkGetters: true}) :
        [];

      let remainingKeys = keys.filter(key => !classProperties.includes(key));

      if (context.features.serialization.SORT_PROPERTIES_ALPHABETICALLY || jsonPropertyOrder.alphabetic) {
        const remainingKeysToVirtualPropertiesMapping =
          classPropertiesToVirtualPropertiesMapping(currentMainCreator, remainingKeys, context);
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
    const jsonProperty: JsonPropertyOptions = getMetadata('JsonProperty', context.mainCreator[0], oldKey, context);
    if (jsonProperty) {
      return jsonProperty.access === JsonPropertyAccess.WRITE_ONLY;
    }
    return false;
  }

  /**
   *
   * @param replacement
   * @param oldKey
   * @param newKey
   * @param context
   * @param namingMap
   */
  private stringifyJsonVirtualProperty(replacement: any, oldKey: string, newKey: string,
                                       context: JsonStringifierTransformerContext, namingMap: Map<string, string>): string {
    const jsonVirtualProperty: JsonPropertyOptions | JsonGetterOptions =
      getMetadata('JsonVirtualProperty:' + oldKey, context.mainCreator[0], null, context);

    if (jsonVirtualProperty && jsonVirtualProperty.value !== oldKey) {
      const newKeyUpdated = this.stringifyJsonNaming(replacement, jsonVirtualProperty.value, context);
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
   * @param oldKey
   * @param newKey
   * @param context
   */
  private stringifyJsonRawValue(replacement: any, oldKey: string, newKey: string,
                                context: JsonStringifierTransformerContext): void {
    const jsonRawValue = hasMetadata('JsonRawValue', context.mainCreator[0], oldKey, context);
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
    const jsonValue: JsonValueOptions = getMetadata('JsonValue', context.mainCreator[0], null, context);
    if (jsonValue) {
      return (typeof obj[jsonValue._propertyKey] === 'function') ? obj[jsonValue._propertyKey]() : obj[jsonValue._propertyKey];
    }
    return null;
  }

  /**
   *
   * @param replacement
   * @param context
   */
  private stringifyJsonRootName(replacement: any, context: JsonStringifierTransformerContext): any {
    if (context.features.serialization.WRAP_ROOT_VALUE) {
      const jsonRootName: JsonRootNameOptions =
        getMetadata('JsonRootName', context.mainCreator[0], null, context);
      const wrapKey = (jsonRootName && jsonRootName.value) ? jsonRootName.value : context.mainCreator[0].constructor.name;

      const newReplacement = {};
      newReplacement[wrapKey] = replacement;
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
      getMetadata('JsonSerialize', context.mainCreator[0], null, context);
    if (jsonSerialize && jsonSerialize.using) {
      return jsonSerialize.using(obj, context);
    }
    return obj;
  }

  /**
   *
   * @param replacement
   * @param oldKey
   * @param newKey
   * @param context
   */
  private stringifyJsonSerializeProperty(replacement: any, oldKey: string, newKey: string,
                                         context: JsonStringifierTransformerContext): void {
    const jsonSerialize: JsonSerializeOptions = getMetadata('JsonSerialize', context.mainCreator[0], oldKey, context);
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
    const jsonSerialize: JsonSerializeOptions = getMetadata('JsonSerialize', context.mainCreator[0], oldKey, context);
    if (jsonSerialize && jsonSerialize.nullsUsing) {
      replacement[newKey] = jsonSerialize.nullsUsing(context);
    }
  }

  /**
   *
   * @param key
   * @param context
   */
  private stringifyHasJsonIgnore(key: string, context: JsonStringifierTransformerContext): boolean {
    const currentMainCreator = context.mainCreator[0];

    const hasJsonIgnore = hasMetadata('JsonIgnore', currentMainCreator, key, context);

    if (!hasJsonIgnore) {
      const jsonIgnoreProperties: JsonIgnorePropertiesOptions =
        getMetadata('JsonIgnoreProperties', currentMainCreator, null, context);
      if (jsonIgnoreProperties) {
        const jsonVirtualProperty: JsonPropertyOptions | JsonGetterOptions =
          getMetadata('JsonVirtualProperty:' + key, currentMainCreator, null, context);

        if (jsonVirtualProperty && jsonIgnoreProperties.value.includes(jsonVirtualProperty.value)) {
          if (jsonVirtualProperty._descriptor != null && typeof jsonVirtualProperty._descriptor.value === 'function' &&
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

    let jsonInclude: JsonIncludeOptions =
      getMetadata('JsonInclude', currentMainCreator, key, context);
    if (!jsonInclude) {
      jsonInclude = getMetadata('JsonInclude', currentMainCreator, null, context);
      jsonInclude = jsonInclude ? jsonInclude : context.features.serialization.DEFAULT_PROPERTY_INCLUSION;
    }

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
  private stringifyHasJsonIgnoreTypeByKey(replacement: any, key: string, context: JsonStringifierTransformerContext): boolean {
    const currentMainCreator = context.mainCreator[0];
    let classType: ClassList<ClassType<any>>;

    const jsonClass: JsonClassTypeOptions = getMetadata('JsonClassType', currentMainCreator, key, context);
    if (jsonClass && jsonClass.type) {
      classType = jsonClass.type();
    } else {
      classType = [Object];
    }
    const value = replacement[key];
    if (value != null && value.constructor !== Object) {
      classType[0] = value.constructor;
    }
    return hasMetadata('JsonIgnoreType', classType[0], null, context);
  }

  /**
   *
   * @param value
   * @param key
   * @param context
   */
  private stringifyHasJsonIgnoreTypeByValue(value: any, key: string, context: JsonStringifierTransformerContext): boolean {
    let classType: ClassList<ClassType<any>>;

    const jsonClass: JsonClassTypeOptions = getMetadata('JsonClassType', context._propertyParentCreator, key, context);
    if (jsonClass && jsonClass.type) {
      classType = jsonClass.type();
    } else {
      classType = [Object];
    }
    if (value != null && value.constructor !== Object) {
      classType[0] = value.constructor;
    }
    return hasMetadata('JsonIgnoreType', classType[0], null, context);
  }

  /**
   *
   * @param key
   * @param context
   */
  private stringifyHasJsonBackReference(key: string, context: JsonStringifierTransformerContext): boolean {
    return hasMetadata('JsonBackReference', context.mainCreator[0], key, context);
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param parent
   * @param context
   */
  private stringifyJsonTypeInfo(replacement: any, obj: any, parent: any, context: JsonStringifierTransformerContext): any {
    const currentMainCreator = context.mainCreator[0];

    const jsonTypeInfo: JsonTypeInfoOptions = getMetadata('JsonTypeInfo', currentMainCreator, null, context);
    if (jsonTypeInfo) {
      let jsonTypeName: string;

      const jsonTypeIdResolver: JsonTypeIdResolverOptions =
        getMetadata('JsonTypeIdResolver', currentMainCreator, null, context);
      if (jsonTypeIdResolver && jsonTypeIdResolver.resolver) {
        jsonTypeName = jsonTypeIdResolver.resolver.idFromValue(obj, context);
      }

      if (!jsonTypeName) {
        const jsonTypeId: JsonTypeIdOptions =
          getMetadata('JsonTypeId', currentMainCreator, null, context);
        if (jsonTypeId) {
          if (typeof obj[jsonTypeId._propertyKey] === 'function') {
            jsonTypeName = obj[jsonTypeId._propertyKey]();
          } else {
            jsonTypeName = obj[jsonTypeId._propertyKey];
            delete replacement[jsonTypeId._propertyKey];
          }
        }
      }

      if (!jsonTypeName) {
        const jsonSubTypes: JsonSubTypesOptions =
          getMetadata('JsonSubTypes', currentMainCreator, null, context);
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
        const jsonTypeNameOptions: JsonTypeNameOptions =
          getMetadata('JsonTypeName', currentMainCreator, null, context);
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
      case JsonTypeInfoAs.EXTERNAL_PROPERTY:
        const parentReplacement = parent ?? replacement;
        parentReplacement[jsonTypeInfo.property] = jsonTypeName;
      }

    }
    return replacement;
  }

  /**
   *
   * @param replacement
   * @param oldKey
   * @param newKey
   * @param context
   */
  private stringifyJsonFormatProperty(replacement: any, oldKey: string, newKey: string,
                                      context: JsonStringifierTransformerContext): any {
    const jsonFormat: JsonFormatOptions = getMetadata('JsonFormat', context.mainCreator[0], oldKey, context);
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
    const jsonFormat: JsonFormatOptions = getMetadata('JsonFormat', context.mainCreator[0], null, context);
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
        const timezone = (jsonFormat.timezone) ? { timeZone: jsonFormat.timezone } : {};
        const dateLibrary = jsonFormat.dateLibrary != null ? jsonFormat.dateLibrary : context.dateLibrary;
        if (dateLibrary == null) {
          // eslint-disable-next-line max-len
          throw new JacksonError('No date library has been set. To be able to use @JsonFormat() on class properties of type "Date" with JsonFormatShape.STRING, a date library needs to be set. Date libraries supported: "https://github.com/moment/moment", "https://github.com/iamkun/dayjs/".');
        }
        formattedValue = dateLibrary(
          new Date(replacement.toLocaleString('en-US', timezone))).locale(locale).format(jsonFormat.pattern);
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
   * @param key
   * @param context
   */
  private stringifyHasJsonView(key: string, context: JsonStringifierTransformerContext): boolean {
    const currentMainCreator = context.mainCreator[0];

    if (context.withViews) {
      let jsonView: JsonViewOptions =
        getMetadata('JsonView', currentMainCreator, key, context);
      if (!jsonView) {
        jsonView = getMetadata('JsonView', currentMainCreator, null, context);
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

      return context.features.serialization.DEFAULT_VIEW_INCLUSION;
    }
    return true;
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param parent
   * @param oldKey
   * @param newKey
   * @param context
   * @param globalContext
   * @param valueAlreadySeen
   */
  private stringifyJsonUnwrapped(replacement: any, obj: any, parent: any, oldKey: string, newKey: string,
                                 context: JsonStringifierTransformerContext, globalContext: JsonStringifierGlobalContext,
                                 valueAlreadySeen: Map<any, any>): void {
    const currentMainCreator = context.mainCreator[0];
    const jsonUnwrapped: JsonUnwrappedOptions = getMetadata('JsonUnwrapped', currentMainCreator, oldKey, context);

    if (jsonUnwrapped) {
      let objValue = (typeof obj[oldKey] === 'function') ? obj[oldKey]() : obj[oldKey];
      const newContext = cloneDeep(context);
      let newMainCreator;
      const jsonClass: JsonClassTypeOptions = getMetadata('JsonClassType', currentMainCreator, oldKey, context);
      if (jsonClass && jsonClass.type) {
        newMainCreator = jsonClass.type();
      } else {
        newMainCreator = [Object];
      }
      if (obj[oldKey] != null && objValue.constructor !== Object) {
        newMainCreator[0] = objValue.constructor;
      }
      newContext.mainCreator = newMainCreator;

      const hasJsonTypeInfo = (typeof objValue === 'object') ?
        hasMetadata('JsonTypeInfo', newContext.mainCreator, null, newContext) : false;
      if (hasJsonTypeInfo) {
        // eslint-disable-next-line max-len
        throw new JacksonError(`Unwrapped property requires use of type information: cannot serialize (through reference chain: ${currentMainCreator.name}["${oldKey}"])`);
      }

      const prefix = (jsonUnwrapped.prefix != null) ? jsonUnwrapped.prefix : '';
      const suffix = (jsonUnwrapped.suffix != null) ? jsonUnwrapped.suffix : '';

      objValue = castObjLiteral(newContext.mainCreator[0], objValue);

      const objTransformed = this.deepTransform(oldKey, objValue, parent, newContext, globalContext, new Map(valueAlreadySeen));
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
   * @param globalContext
   */
  private stringifyJsonIdentityInfo(replacement: any, obj: any, context: JsonStringifierTransformerContext,
                                    globalContext: JsonStringifierGlobalContext): void {
    const currentMainCreator = context.mainCreator[0];

    const jsonIdentityInfo: JsonIdentityInfoOptions =
      getMetadata('JsonIdentityInfo', currentMainCreator, null, context);

    if (jsonIdentityInfo) {

      if (globalContext.globalValueAlreadySeen.has(obj)) {
        replacement[jsonIdentityInfo.property] = globalContext.globalValueAlreadySeen.get(obj);
      } else {
        if (typeof jsonIdentityInfo.generator === 'function') {
          replacement[jsonIdentityInfo.property] = jsonIdentityInfo.generator(obj);
        } else {

          let uuidLibrary;
          if (jsonIdentityInfo.generator === ObjectIdGenerator.UUIDv5Generator ||
            jsonIdentityInfo.generator === ObjectIdGenerator.UUIDv4Generator ||
            jsonIdentityInfo.generator === ObjectIdGenerator.UUIDv3Generator ||
            jsonIdentityInfo.generator === ObjectIdGenerator.UUIDv1Generator) {
            uuidLibrary = jsonIdentityInfo.uuidLibrary != null ? jsonIdentityInfo.uuidLibrary : context.uuidLibrary;
            if (uuidLibrary == null) {
              // eslint-disable-next-line max-len
              throw new JacksonError('No UUID library has been set. To be able to use @JsonIdentityInfo() with any UUID ObjectIdGenerator, an UUID library needs to be set. UUID library supported: "https://github.com/uuidjs/uuid".');
            }
          }

          switch (jsonIdentityInfo.generator) {
          case ObjectIdGenerator.IntSequenceGenerator:
            globalContext.intSequenceGenerator++;
            replacement[jsonIdentityInfo.property] = globalContext.intSequenceGenerator;
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

            replacement[jsonIdentityInfo.property] = uuidLibrary.v5(...uuidv5Args);
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

            replacement[jsonIdentityInfo.property] = uuidLibrary.v4(...uuidv4Args);
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

            replacement[jsonIdentityInfo.property] = uuidLibrary.v3(...uuidv3Args);
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

            replacement[jsonIdentityInfo.property] = uuidLibrary.v1(...uuidv1Args);
            break;
          }
        }
      }

      if (!globalContext.globalValueAlreadySeen.has(obj)) {
        const objIdentifier = (typeof replacement[jsonIdentityInfo.property] === 'function') ?
          replacement[jsonIdentityInfo.property]() :
          replacement[jsonIdentityInfo.property];
        globalContext.globalValueAlreadySeen.set(obj, objIdentifier);
      }
    }
  }

  /**
   *
   * @param context
   */
  private hasJsonIdentityReferenceAlwaysAsId(context: JsonStringifierTransformerContext): boolean {
    const currentMainCreator = context.mainCreator[0];

    const jsonIdentityInfo: JsonIdentityInfoOptions =
      getMetadata('JsonIdentityInfo', currentMainCreator, null, context);
    const jsonIdentityReference: JsonIdentityReferenceOptions =
      getMetadata('JsonIdentityReference', currentMainCreator, null, context);
    return jsonIdentityReference != null && jsonIdentityReference.alwaysAsId && jsonIdentityInfo != null;
  }

  /**
   *
   * @param obj
   * @param context
   */
  private stringifyJsonIdentityReference(obj: any, context: JsonStringifierTransformerContext): any {
    const jsonIdentityInfo: JsonIdentityInfoOptions =
      getMetadata('JsonIdentityInfo', context.mainCreator[0], null, context);
    return obj[jsonIdentityInfo.property];
  }

  /**
   *
   * @param key
   * @param iterableNoString
   * @param context
   * @param globalContext
   * @param valueAlreadySeen
   */
  private stringifyIterable(key: string, iterableNoString: any,
                            context: JsonStringifierTransformerContext, globalContext: JsonStringifierGlobalContext,
                            valueAlreadySeen: Map<any, any>): any[] {
    const jsonSerialize: JsonSerializeOptions =
      getMetadata('JsonSerialize',
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

      value = castObjLiteral(newContext.mainCreator[0], value);

      if (this.stringifyHasJsonIgnoreTypeByValue(value, key, newContext)) {
        continue;
      }

      newIterable.push(this.deepTransform(key, value, undefined, newContext, globalContext, new Map(valueAlreadySeen)));
    }
    return newIterable;
  }

  /**
   *
   * @param key
   * @param map
   * @param context
   * @param globalContext
   * @param valueAlreadySeen
   */
  private stringifyMapAndObjLiteral(key: string, map: Map<any, any> | Record<string, any>,
                                    context: JsonStringifierTransformerContext, globalContext: JsonStringifierGlobalContext,
                                    valueAlreadySeen: Map<any, any>): any {
    const currentCreators = context.mainCreator;

    const jsonSerialize: JsonSerializeOptions = getMetadata('JsonSerialize', context._propertyParentCreator, key, context);

    let jsonInclude: JsonIncludeOptions =
      getMetadata('JsonInclude', context._propertyParentCreator, key, context);
    if (!jsonInclude) {
      jsonInclude = getMetadata('JsonInclude', context._propertyParentCreator, null, context);
      jsonInclude = jsonInclude ? jsonInclude : context.features.serialization.DEFAULT_PROPERTY_INCLUSION;
    }

    const newValue = {};
    let mapKeys = (map instanceof Map) ? [...map.keys()] : getObjectKeysWithPropertyDescriptorNames(map, null, context);
    if (context.features.serialization.ORDER_MAP_AND_OBJECT_LITERAL_ENTRIES_BY_KEYS) {
      mapKeys = mapKeys.sort();
    }

    const newContext = cloneDeep(context);
    if (currentCreators.length > 1 && currentCreators[1] instanceof Array) {
      newContext.mainCreator = currentCreators[1] as [ClassType<any>];
    } else {
      newContext.mainCreator = [Object];
    }
    const mapCurrentCreators = newContext.mainCreator;

    for (let mapKey of mapKeys) {
      let mapValue = (map instanceof Map) ? map.get(mapKey) : map[mapKey];

      const keyNewContext = cloneDeep(newContext);
      const valueNewContext = cloneDeep(newContext);

      if (mapCurrentCreators[0] instanceof Array) {
        keyNewContext.mainCreator = mapCurrentCreators[0] as [ClassType<any>];
      } else {
        keyNewContext.mainCreator = [mapCurrentCreators[0]] as [ClassType<any>];
      }
      if (keyNewContext.mainCreator[0] === Object) {
        keyNewContext.mainCreator[0] = mapKey.constructor;
      }

      if (mapCurrentCreators.length > 1) {
        if (mapCurrentCreators[1] instanceof Array) {
          valueNewContext.mainCreator = mapCurrentCreators[1] as [ClassType<any>];
        } else {
          valueNewContext.mainCreator = [mapCurrentCreators[1]] as [ClassType<any>];
        }
      } else {
        valueNewContext.mainCreator = [Object];
      }
      if (mapValue != null && mapValue.constructor !== Object && valueNewContext.mainCreator[0] === Object) {
        valueNewContext.mainCreator[0] = mapValue.constructor;
      }

      if (jsonSerialize && (jsonSerialize.contentUsing || jsonSerialize.keyUsing)) {
        mapKey = (jsonSerialize.keyUsing) ? jsonSerialize.keyUsing(mapKey, keyNewContext) : mapKey;
        mapValue = (jsonSerialize.contentUsing) ?
          jsonSerialize.contentUsing(mapValue, valueNewContext) : mapValue;

        if (mapKey != null && mapKey.constructor !== Object) {
          keyNewContext.mainCreator[0] = mapKey.constructor;
        }
        if (mapValue != null && mapValue.constructor !== Object) {
          valueNewContext.mainCreator[0] = mapValue.constructor;
        }
      }

      if (jsonInclude && jsonInclude.content != null && jsonInclude.content !== JsonIncludeType.ALWAYS) {
        switch (jsonInclude.content) {
        case JsonIncludeType.NON_EMPTY:
          if (isValueEmpty(mapValue)) {
            continue;
          }
          break;
        case JsonIncludeType.NON_NULL:
          if (mapValue == null) {
            continue;
          }
          break;
        case JsonIncludeType.NON_DEFAULT:
          if (mapValue === getDefaultValue(mapValue) || isValueEmpty(mapValue)) {
            continue;
          }
          break;
        case JsonIncludeType.CUSTOM:
          if (jsonInclude.contentFilter(mapValue)) {
            continue;
          }
          break;
        }
      }

      if (context.features.serialization.WRITE_DATE_KEYS_AS_TIMESTAMPS) {
        if (map instanceof Map && mapKey instanceof Date) {
          mapKey = mapKey.getTime();
        } else if (!(map instanceof Map) && currentCreators[0] === Object &&
          isSameConstructorOrExtensionOfNoObject(keyNewContext.mainCreator[0], Date)) {
          mapKey = (new keyNewContext.mainCreator[0](mapKey)).getTime();
        }
      }

      mapValue = castObjLiteral(newContext.mainCreator[0], mapValue);

      if (this.stringifyHasJsonIgnoreTypeByValue(mapValue, key, valueNewContext)) {
        continue;
      }

      const mapValueStringified = this.deepTransform(mapKey, mapValue, map, valueNewContext, globalContext, new Map(valueAlreadySeen));
      newValue[mapKey.toString()] = mapValueStringified;
    }
    return newValue;
  }

  /**
   *
   * @param filter
   * @param key
   * @param context
   */
  private isPropertyKeyExcludedByJsonFilter(filter: JsonStringifierFilterOptions,
                                            key: string,
                                            context: JsonStringifierTransformerContext): boolean {
    if (filter.values == null) {
      return false;
    }
    const jsonProperty: JsonPropertyOptions =
      getMetadata('JsonProperty', context.mainCreator[0], key, context);
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
   * @param key
   * @param context
   */
  private stringifyIsPropertyKeyExcludedByJsonFilter(key: string, context: JsonStringifierTransformerContext): boolean {
    const jsonFilter: JsonFilterOptions =
      getMetadata('JsonFilter', context.mainCreator[0], null, context);
    if (jsonFilter) {
      const filter = context.filters[jsonFilter.value];
      if (filter) {
        return this.isPropertyKeyExcludedByJsonFilter(filter, key, context);
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
    const jsonFilter: JsonFilterOptions = getMetadata('JsonFilter', currentMainCreator, oldKey, context);
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
          const jsonClass: JsonClassTypeOptions = getMetadata('JsonClassType', currentMainCreator, oldKey, context);
          if (jsonClass && jsonClass.type) {
            newMainCreator = jsonClass.type();
          } else {
            newMainCreator = [Object];
          }
          if (obj[oldKey] != null && obj[oldKey].constructor !== Object) {
            newMainCreator[0] = obj[oldKey].constructor;
          }
          newContext.mainCreator = newMainCreator;

          const isExcluded = this.isPropertyKeyExcludedByJsonFilter(filter, propertyKey, newContext);
          if (isExcluded) {
            delete replacement[newKey][propertyKey];
          }
        }
      }
    }
  }

  /**
   *
   * @param context
   */
  private isPrependJsonAppend(context: JsonStringifierTransformerContext) {
    const jsonAppend: JsonAppendOptions =
      getMetadata('JsonAppend', context.mainCreator[0], null, context);
    return jsonAppend && jsonAppend.prepend;
  }

  /**
   *
   * @param replacement
   * @param context
   */
  private stringifyJsonAppend(replacement: any, context: JsonStringifierTransformerContext) {
    const currentMainCreator = context.mainCreator[0];

    const jsonAppend: JsonAppendOptions =
      getMetadata('JsonAppend', currentMainCreator, null, context);
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
   * @param key
   * @param context
   */
  private stringifyJsonNaming(replacement: any, key: string, context: JsonStringifierTransformerContext): string {
    const jsonNamingOptions: JsonNamingOptions = getMetadata('JsonNaming', context.mainCreator[0], null, context);
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
