/**
 * @packageDocumentation
 * @module Core
 */

import {
  classHasOwnProperty,
  getArgumentNames,
  getClassProperties,
  getDeepestClass,
  getDefaultPrimitiveTypeValue,
  getMetadata,
  getMetadataKeys,
  hasMetadata,
  isClassIterable,
  isClassIterableNoMapNoString,
  isConstructorPrimitiveType,
  isFloat,
  isIterableNoMapNoString,
  isSameConstructor,
  isSameConstructorOrExtensionOf,
  isSameConstructorOrExtensionOfNoObject,
  mapClassPropertyToVirtualProperty,
  mapVirtualPropertiesToClassProperties,
  mapVirtualPropertyToClassProperty
} from '../util';
import {
  ClassType,
  ClassTypeWithDecoratorDefinitions,
  JsonAliasOptions,
  JsonAppendOptions,
  JsonClassOptions,
  JsonDecoratorOptions,
  JsonDeserializeOptions,
  JsonIdentityInfoOptions,
  JsonIgnorePropertiesOptions,
  JsonInjectOptions,
  JsonManagedReferenceOptions,
  JsonNamingOptions,
  JsonParserContext,
  JsonParserTransformerContext,
  JsonPropertyOptions,
  JsonRootNameOptions,
  JsonStringifierTransformerContext,
  JsonSubTypesOptions,
  JsonTypeIdResolverOptions,
  JsonTypeInfoOptions,
  JsonViewOptions
} from '../@types';
import {JsonPropertyAccess} from '../decorators/JsonProperty';
import {JsonTypeInfoAs, JsonTypeInfoId} from '../decorators/JsonTypeInfo';
import {DeserializationFeature} from '../databind/DeserializationFeature';
import {JacksonError} from './JacksonError';
import {
  JsonAnySetterPrivateOptions,
  JsonBackReferencePrivateOptions,
  JsonCreatorPrivateOptions,
  JsonGetterPrivateOptions,
  JsonPropertyPrivateOptions,
  JsonSetterPrivateOptions, JsonUnwrappedPrivateOptions
} from '../@types/private';
import {PropertyNamingStrategy} from '../decorators/JsonNaming';
import {defaultCreatorName, JsonCreatorMode} from '../decorators/JsonCreator';
import * as cloneDeep from 'lodash.clonedeep';
import {JsonSetterNulls} from '../decorators/JsonSetter';
import {MapperFeature} from '../databind/MapperFeature';

/**
 *
 */
export class JsonParser<T> {

  /**
   * Map used to restore object circular references defined with @JsonIdentityInfo()
   */
  private _globalValueAlreadySeen = new Map<string, any>();

  private _globalUnresolvedValueAlreadySeen = new Set<string>();

  /**
   *
   */
  constructor() {
  }

  /**
   *
   * @param text
   * @param context
   */
  parse(text: string, context: JsonParserContext = {}): T {
    const value = JSON.parse(text);
    const newContext: JsonParserTransformerContext = this.convertParserContextToTransformerContext(context);
    const result = this.transform('', value, newContext);
    return result;
  }

  /**
   *
   * @param key
   * @param value
   * @param context
   */
  transform(key: string, value: any, context: JsonParserTransformerContext = {}): any {
    context.mainCreator = (context.mainCreator && context.mainCreator[0] !== Object) ?
      context.mainCreator : [(value != null) ? value.constructor : Object];
    context._propertyParentCreator = context.mainCreator[0];
    context._internalDecorators = new Map();
    context = cloneDeep(context);

    const result = this.deepTransform('', value, context);
    if (this._globalUnresolvedValueAlreadySeen.size > 0 &&
      context.features.deserialization[DeserializationFeature.FAIL_ON_UNRESOLVED_OBJECT_IDS]) {
      throw new JacksonError(`Found unresolved Object Ids: ${[...this._globalUnresolvedValueAlreadySeen].join(', ')}`);
    }
    return result;
  }

  /**
   *
   * @param key
   * @param value
   * @param context
   */
  private deepTransform(key: string, value: any, context: JsonParserTransformerContext): any {
    context = {
      features: {
        mapper: [],
        deserialization: []
      },
      deserializers: [],
      injectableValues: {},
      decoratorsEnabled: {},
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
        ...context.forType.get(context.mainCreator[0])
      };
      context = cloneDeep(context);
    }

    value = this.invokeCustomDeserializers(key, value, context);
    value = this.parseJsonDeserializeClass(value, context);

    if (value == null && isConstructorPrimitiveType(context.mainCreator[0])) {
      value = this.getDefaultValue(context);
    }

    if ( (value instanceof Array && value.length === 0 &&
      context.features.deserialization[DeserializationFeature.ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT]) ||
      (value != null && value.constructor === String && value.length === 0 &&
        context.features.deserialization[DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT]) ) {
      value = null;
    }

    const currentMainCreator = context.mainCreator[0];
    if (value == null && context.features.deserialization[DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES] &&
      isConstructorPrimitiveType(currentMainCreator)) {
      throw new JacksonError(`Cannot map "null" into primitive type ${(currentMainCreator as ObjectConstructor).name}`);
    }

    if (value != null && value.constructor === Number &&
      context.features.deserialization[DeserializationFeature.ACCEPT_FLOAT_AS_INT] && isFloat(value)) {
      value = parseInt(value + '', 10);
    }

    if (value != null) {

      let instance = this.getInstanceAlreadySeen(key, value, context);
      if (instance != null) {
        return instance;
      }

      value = this.parseJsonTypeInfo(value, context);

      if (isSameConstructorOrExtensionOfNoObject(currentMainCreator, Map)) {
        return this.parseMap(key, value, context);
      } else if (BigInt && isSameConstructorOrExtensionOfNoObject(currentMainCreator, BigInt)) {
        return (value != null && value.constructor === String && value.endsWith('n')) ?
          // @ts-ignore
          currentMainCreator(value.substring(0, value.length - 1)) :
          // @ts-ignore
          currentMainCreator(value);
      } else if (isSameConstructorOrExtensionOfNoObject(currentMainCreator, RegExp) ||
        isSameConstructorOrExtensionOfNoObject(currentMainCreator, Date)) {
        // @ts-ignore
        return new currentMainCreator(value);
      } else if (typeof value === 'object' && !isIterableNoMapNoString(value)) {

        if (this.parseJsonIgnoreType(context)) {
          return null;
        }

        let replacement = value;
        replacement = this.parseJsonRootName(replacement, context);

        this.parseJsonUnwrapped(replacement, context);
        this.parseJsonVirtualPropertyAndJsonAlias(replacement, context);
        this.parseJsonNaming(replacement, context);

        let keys = Object.keys(replacement);
        keys = mapVirtualPropertiesToClassProperties(currentMainCreator, keys, {checkSetters: true});

        const classPropertiesToBeExcluded: string[] = [];

        for (let k of keys) {

          if (currentMainCreator === Object) {
            const jsonDeserialize: JsonDeserializeOptions =
              getMetadata('jackson:JsonDeserialize', context._propertyParentCreator, key, context);

            if (jsonDeserialize && (jsonDeserialize.contentUsing || jsonDeserialize.keyUsing)) {
              const newObjKey = (jsonDeserialize.keyUsing) ? jsonDeserialize.keyUsing(k, context) : k;
              const newObjValue = (jsonDeserialize.contentUsing) ?
                jsonDeserialize.contentUsing(replacement[k], context) : replacement[k];
              if (k !== newObjKey) {
                delete replacement[k];
                k = newObjKey;
              }
              replacement[newObjKey] = newObjValue;
            }
          }

          if (classHasOwnProperty(currentMainCreator, k, replacement, {withSettersAsProperty: true})) {
            const jsonClass: JsonClassOptions = getMetadata('jackson:JsonClass', context.mainCreator[0], k, context);
            this.propagateDecorators(jsonClass, replacement, k, context);

            if (this.parseHasJsonIgnore(context, k) || !this.parseIsIncludedByJsonViewProperty(context, k)) {
              classPropertiesToBeExcluded.push(k);
              delete replacement[k];
            } else {
              this.parseJsonRawValue(context, replacement, k);
              this.parseJsonDeserializeProperty(k, replacement, context);
            }
          }
        }
        instance = this.parseJsonCreator(context, replacement, classPropertiesToBeExcluded);
        if (instance) {
          replacement = instance;
        }

        return replacement;
      } else if (isIterableNoMapNoString(value)) {
        const replacement = this.parseIterable(value, key, context);
        return replacement;
      }
    }

    return value;
  }

  /**
   *
   * @param context
   */
  private convertParserContextToTransformerContext(context: JsonParserContext): JsonParserTransformerContext {
    const newContext: JsonParserTransformerContext = {
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
   * @param context
   */
  private getDefaultValue(context: JsonParserTransformerContext): any | null {
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
   * Propagate decorators to class properties or parameters,
   * only for the first level (depth) of recursion.
   *
   * Used, for example, in case of decorators applied on an iterable, such as an Array.
   * In this case, the decorators are applied to each item of the iterable and not on the iterable itself.
   *
   * @param jsonClass
   * @param key
   * @param context
   * @param methodName
   * @param argumentIndex
   */
  private propagateDecorators(jsonClass: JsonClassOptions,
                              obj: any,
                              key: string,
                              context: JsonParserTransformerContext,
                              methodName?: string,
                              argumentIndex?: number): void {
    const currentMainCreator = context.mainCreator[0];

    // Decorators list that can be propagated
    const metadataKeysForDeepestClass = [
      'jackson:JsonIgnoreProperties',
      'jackson:JsonIgnorePropertiesParam:' + argumentIndex,
      'jackson:JsonTypeInfo',
      'jackson:JsonTypeInfoParam:' + argumentIndex,
      'jackson:JsonSubTypes',
      'jackson:JsonSubTypesParam:' + argumentIndex,
      'jackson:JsonTypeIdResolver',
      'jackson:JsonTypeIdResolverParam:' + argumentIndex,
      'jackson:JsonIdentityInfo',
      'jackson:JsonIdentityInfoParam:' + argumentIndex
    ];

    const metadataKeysForFirstClass = [
      'jackson:JsonDeserializeParam:' + argumentIndex
    ];

    let deepestClass = null;
    const decoratorsNameFoundForDeepestClass: string[] = [];
    const decoratorsToBeAppliedForDeepestClass = {
      depth: 1
    };

    let firstClass = null;
    const decoratorsNameFoundForFirstClass: string[] = [];
    const decoratorsToBeAppliedForFirstClass = {
      depth: 1
    };

    if (jsonClass) {
      firstClass = jsonClass.class()[0];
      deepestClass = getDeepestClass(jsonClass.class());
    } else {
      firstClass = (obj[key] != null) ? obj[key].constructor : Object;
      deepestClass = (obj[key] != null) ? obj[key].constructor : Object;
    }

    for (const metadataKey of metadataKeysForDeepestClass) {
      const jsonDecoratorOptions: JsonDecoratorOptions = (!metadataKey.includes('Param:')) ?
        getMetadata(metadataKey, currentMainCreator, key, context) :
        getMetadata(metadataKey, currentMainCreator, methodName, context);

      if (jsonDecoratorOptions) {
        if (metadataKey.includes('Param:') && deepestClass != null && methodName != null && argumentIndex != null) {
          const jsonClassParam: JsonClassOptions = getMetadata('jackson:JsonClassParam:' + argumentIndex, currentMainCreator, methodName);
          decoratorsToBeAppliedForDeepestClass[metadataKey.substring(0, metadataKey.indexOf('Param:'))] = jsonDecoratorOptions;
          decoratorsToBeAppliedForDeepestClass['jackson:JsonClass'] = jsonClassParam;
          if (jsonClassParam == null) {
            jsonClass = null;
          }
          decoratorsNameFoundForDeepestClass.push(metadataKey.replace('jackson:', '').substring(0, metadataKey.indexOf('Param:')));
        } else {
          decoratorsToBeAppliedForDeepestClass[metadataKey] = jsonDecoratorOptions;
          decoratorsNameFoundForDeepestClass.push(metadataKey.replace('jackson:', ''));
        }
      }
    }

    for (const metadataKey of metadataKeysForFirstClass) {
      const jsonDecoratorOptions: JsonDecoratorOptions = (!metadataKey.includes('Param:')) ?
        getMetadata(metadataKey, currentMainCreator, key, context) :
        getMetadata(metadataKey, currentMainCreator, methodName, context);

      if (jsonDecoratorOptions) {
        if (metadataKey.includes('Param:') && firstClass != null && methodName != null && argumentIndex != null) {
          const jsonClassParam: JsonClassOptions = getMetadata('jackson:JsonClassParam:' + argumentIndex, currentMainCreator, methodName);
          decoratorsToBeAppliedForFirstClass[metadataKey.substring(0, metadataKey.indexOf('Param:'))] = jsonDecoratorOptions;
          decoratorsToBeAppliedForFirstClass['jackson:JsonClass'] = jsonClassParam;
          if (jsonClassParam == null) {
            jsonClass = null;
          }
          decoratorsNameFoundForFirstClass.push(metadataKey.replace('jackson:', '').substring(0, metadataKey.indexOf('Param:')));
        } else {
          decoratorsToBeAppliedForFirstClass[metadataKey] = jsonDecoratorOptions;
          decoratorsNameFoundForFirstClass.push(metadataKey.replace('jackson:', ''));
        }
      }
    }

    if (deepestClass != null && decoratorsNameFoundForDeepestClass.length > 0) {
      context._internalDecorators.set(deepestClass, decoratorsToBeAppliedForDeepestClass);
    }
    if (firstClass != null && decoratorsNameFoundForFirstClass.length > 0) {
      context._internalDecorators.set(firstClass, decoratorsToBeAppliedForFirstClass);
    }
  }

  /**
   *
   * @param key
   * @param value
   * @param context
   */
  private invokeCustomDeserializers(key: string, value: any, context: JsonParserTransformerContext): any {
    if (context.deserializers) {
      const currentMainCreator = context.mainCreator[0];
      for (const deserializer of context.deserializers) {
        if (deserializer.type != null) {
          const classType = deserializer.type();
          if (
            (value != null && typeof classType === 'string' && classType !== typeof value) ||
            (typeof classType !== 'string' && currentMainCreator != null &&
              !isSameConstructorOrExtensionOf(classType, currentMainCreator))
          ) {
            continue;
          }
        }
        const virtualProperty = mapClassPropertyToVirtualProperty(currentMainCreator, key);
        value = deserializer.mapper(virtualProperty, value, context);
      }
    }
    return value;
  }

  /**
   *
   * @param key
   * @param value
   * @param context
   */
  private getInstanceAlreadySeen(key: string, value: any, context: JsonParserTransformerContext): null | any {
    const currentMainCreator = context.mainCreator[0];
    const jsonIdentityInfo: JsonIdentityInfoOptions =
      getMetadata('jackson:JsonIdentityInfo', currentMainCreator, null, context);

    if (jsonIdentityInfo) {
      const id: string = typeof value === 'object' ? value[jsonIdentityInfo.property] : value;

      const scope: string = jsonIdentityInfo.scope || '';
      const scopedId = this.generateScopedId(scope, id);

      if (this._globalValueAlreadySeen.has(scopedId)) {
        const instance = this._globalValueAlreadySeen.get(scopedId);
        if (instance.constructor !== currentMainCreator) {
          throw new JacksonError(`Already had Class "${instance.constructor.name}" for id ${id}.`);
        }
        this._globalUnresolvedValueAlreadySeen.delete(scopedId);

        return instance;
      } else if (typeof value !== 'object') {
        this._globalUnresolvedValueAlreadySeen.add(scopedId);
      }
    }

    return null;
  }

  /**
   *
   * @param context
   * @param obj
   */
  private parseJsonCreator(context: JsonParserTransformerContext, obj: any, classPropertiesToBeExcluded: string[]): any {
    if (obj != null) {

      const currentMainCreator = context.mainCreator[0];
      context._propertyParentCreator = currentMainCreator;

      const withCreatorName = context.withCreatorName;

      const jsonCreatorMetadataKey = 'jackson:JsonCreator:' + ((withCreatorName != null) ? withCreatorName : defaultCreatorName);

      const hasJsonCreator =
        hasMetadata(jsonCreatorMetadataKey, currentMainCreator, null, context);

      const jsonCreator: JsonCreatorPrivateOptions | ClassType<any> = (hasJsonCreator) ?
        getMetadata(jsonCreatorMetadataKey, currentMainCreator, null, context) :
        currentMainCreator;

      const jsonIgnoreProperties: JsonIgnorePropertiesOptions =
        getMetadata('jackson:JsonIgnoreProperties', currentMainCreator, null, context);

      const method: any = (hasJsonCreator) ?
        (((jsonCreator as JsonCreatorPrivateOptions).ctor) ?
          (jsonCreator as JsonCreatorPrivateOptions).ctor :
          (jsonCreator as JsonCreatorPrivateOptions).method)
        : jsonCreator;

      let args;
      let argNames;
      let argNamesAliasToBeExcluded;

      let instance;

      if (('mode' in jsonCreator && jsonCreator.mode === JsonCreatorMode.PROPERTIES) || !('mode' in jsonCreator)) {
        const methodName = ('propertyKey' in jsonCreator && jsonCreator.propertyKey) ? jsonCreator.propertyKey : 'constructor';
        const result = this.parseMethodArguments(methodName, method, obj, context, null, true);
        args = result.args != null && result.args.length > 0 ? result.args : [obj];
        argNames = result.argNames;
        argNamesAliasToBeExcluded = result.argNamesAliasToBeExcluded;

        instance = ('method' in jsonCreator && jsonCreator.method) ?
          (method as Function)(...args) : new (method as ObjectConstructor)(...args);
      } else if ('mode' in jsonCreator) {
        switch (jsonCreator.mode) {
        case JsonCreatorMode.DELEGATING:
          instance = ('method' in jsonCreator && jsonCreator.method) ?
            (method as Function)(obj) : new (method as ObjectConstructor)(obj);
          break;
        }
      }

      this.parseJsonIdentityInfo(instance, obj, context);

      const jsonAppendAttributesToBeExcluded = [];
      const jsonAppend: JsonAppendOptions =
        getMetadata('jackson:JsonAppend', currentMainCreator, null, context);
      if (jsonAppend && jsonAppend.attrs && jsonAppend.attrs.length > 0) {
        for (const attr of jsonAppend.attrs) {
          if (attr.value) {
            jsonAppendAttributesToBeExcluded.push(attr.value);
          }
          if (attr.propName) {
            jsonAppendAttributesToBeExcluded.push(attr.propName);
          }
        }
      }

      if (('mode' in jsonCreator && jsonCreator.mode === JsonCreatorMode.PROPERTIES) || !('mode' in jsonCreator)) {
        const keysToBeExcluded = [...new Set([
          ...argNames,
          ...argNamesAliasToBeExcluded,
          ...jsonAppendAttributesToBeExcluded,
          ...classPropertiesToBeExcluded
        ])];

        const classKeys = getClassProperties(currentMainCreator, obj, {
          withSettersAsProperty: true
        });

        const remainingKeys = classKeys.filter(k => Object.hasOwnProperty.call(obj, k) && !keysToBeExcluded.includes(k));

        const hasJsonAnySetter =
          hasMetadata('jackson:JsonAnySetter', currentMainCreator, null, context);
        // add remaining properties and ignore the ones that are not part of "instance"
        for (const key of remainingKeys) {
          const jsonVirtualProperty: JsonPropertyPrivateOptions | JsonSetterPrivateOptions =
            getMetadata('jackson:JsonVirtualProperty:' + key, currentMainCreator, null, context);

          if ( jsonVirtualProperty && jsonVirtualProperty.descriptor != null &&
            (typeof jsonVirtualProperty.descriptor.value === 'function' || jsonVirtualProperty.descriptor.set != null) ) {
            this.parseJsonSetter(instance, obj, key, context);
          } else if ((Object.hasOwnProperty.call(obj, key) && classHasOwnProperty(currentMainCreator, key)) ||
            currentMainCreator.name === 'Object') {
            instance[key] = this.parseJsonClass(context, obj, key);
          } else if (hasJsonAnySetter && Object.hasOwnProperty.call(obj, key)) {
            // for any other unrecognized properties found
            this.parseJsonAnySetter(instance, obj, key, context);
          } else if (!classHasOwnProperty(currentMainCreator, key) &&
            ( (jsonIgnoreProperties == null && context.features.deserialization[DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES]) ||
              (jsonIgnoreProperties != null && !jsonIgnoreProperties.ignoreUnknown)) ) {
            // eslint-disable-next-line max-len
            throw new JacksonError(`Unknown property "${key}" for ${currentMainCreator.name} at [Source '${JSON.stringify(obj)}']`);
          }
        }
      }

      const classProperties = getClassProperties(currentMainCreator);

      for (const classProperty of classProperties) {

        /*
        if (!Object.hasOwnProperty.call(instance, classProperty) &&
          !Object.getOwnPropertyDescriptor(currentMainCreator.prototype, classProperty)) {
          instance[classProperty] = undefined; // set to undefined all the missing class properties (but not descriptors!)
        }
        */

        this.parseJsonInject(instance, obj, classProperty, context);
        // if there is a reference, convert the reference property to the corresponding Class
        this.parseJsonManagedReference(instance, context, obj, classProperty);
      }

      return instance;
    }
  }

  private parseJsonInject(replacement: any, obj: any, key: string, context: JsonParserTransformerContext) {
    const currentMainCreator = context.mainCreator[0];

    let propertySetter;
    let jsonInject: JsonInjectOptions =
      getMetadata('jackson:JsonInject', currentMainCreator, key, context);
    if (!jsonInject) {
      propertySetter = mapVirtualPropertyToClassProperty(currentMainCreator, key, {checkSetters: true});
      jsonInject = getMetadata('jackson:JsonInject', currentMainCreator, propertySetter, context);
    }
    if ( jsonInject && (!jsonInject.useInput || (jsonInject.useInput && replacement[key] == null && obj[key] == null)) ) {
      const injectableValue = context.injectableValues[jsonInject.value];
      if (propertySetter != null && typeof replacement[propertySetter] === 'function') {
        replacement[propertySetter](injectableValue);
      } else {
        replacement[key] = injectableValue;
      }
    }
  }

  private parseJsonSetter(replacement: any, obj: any, key: string, context: JsonParserTransformerContext) {
    const currentMainCreator = context.mainCreator[0];

    const jsonVirtualProperty: JsonPropertyPrivateOptions | JsonSetterPrivateOptions =
      getMetadata('jackson:JsonVirtualProperty:' + key, currentMainCreator, null, context);

    if (('access' in jsonVirtualProperty && jsonVirtualProperty.access !== JsonPropertyAccess.READ_ONLY) ||
      !('access' in jsonVirtualProperty)) {

      if ('required' in jsonVirtualProperty && jsonVirtualProperty.required &&
        !Object.hasOwnProperty.call(obj, jsonVirtualProperty.propertyKey)) {
        // eslint-disable-next-line max-len
        throw new JacksonError(`Required value "${jsonVirtualProperty.value}" not found for ${currentMainCreator.name}.${key} at [Source '${JSON.stringify(obj)}']`);
      }

      let parsedValue;
      if (typeof jsonVirtualProperty.descriptor.value === 'function') {
        parsedValue = this.parseMethodArguments(key, null, obj, context, [jsonVirtualProperty.value], false)
          .args[0];
      } else {
        parsedValue = this.parseJsonClass(context, obj, key);
      }

      if ('nulls' in jsonVirtualProperty || 'contentNulls' in jsonVirtualProperty) {
        if (jsonVirtualProperty.nulls !== JsonSetterNulls.SET && parsedValue == null) {
          switch (jsonVirtualProperty.nulls) {
          case JsonSetterNulls.FAIL:
            // eslint-disable-next-line max-len
            throw new JacksonError(`"${parsedValue}" value found on ${jsonVirtualProperty.value} for ${currentMainCreator.name}.${key} at [Source '${JSON.stringify(obj)}']`);
          case JsonSetterNulls.SKIP:
            return;
          }
        }
        if (jsonVirtualProperty.contentNulls !== JsonSetterNulls.SET) {
          if (isIterableNoMapNoString(parsedValue)) {
            parsedValue = [...parsedValue];
            const indexesToBeRemoved = [];
            for (let i = 0; i < parsedValue.length; i++) {
              const value = parsedValue[i];
              if (value == null) {
                switch (jsonVirtualProperty.contentNulls) {
                case JsonSetterNulls.FAIL:
                  // eslint-disable-next-line max-len
                  throw new JacksonError(`"${value}" value found on ${jsonVirtualProperty.value} at index ${i} for ${currentMainCreator.name}.${key} at [Source '${JSON.stringify(obj)}']`);
                case JsonSetterNulls.SKIP:
                  indexesToBeRemoved.push(i);
                  break;
                }
              }
            }
            while (indexesToBeRemoved.length) {
              parsedValue.splice(indexesToBeRemoved.pop(), 1);
            }
          } else if (parsedValue instanceof Map || (parsedValue != null && parsedValue.constructor === Object)) {
            const entries = (parsedValue instanceof Map) ?
              [...parsedValue.entries()] :
              Object.entries(parsedValue);
            for (const [mapKey, mapValue] of entries) {
              if (mapValue == null) {
                switch (jsonVirtualProperty.contentNulls) {
                case JsonSetterNulls.FAIL:
                  // eslint-disable-next-line max-len
                  throw new JacksonError(`"${mapValue}" value found on ${jsonVirtualProperty.value} at key "${mapKey}" for ${currentMainCreator.name}.${key} at [Source '${JSON.stringify(obj)}']`);
                case JsonSetterNulls.SKIP:
                  if (parsedValue instanceof Map) {
                    parsedValue.delete(mapKey);
                  } else {
                    delete parsedValue[mapKey];
                  }
                  break;
                }
              }
            }
          }
        }
      }

      if (typeof jsonVirtualProperty.descriptor.value === 'function') {
        replacement[key](parsedValue);
      } else {
        replacement[key] = parsedValue;
      }
    }
  }

  /**
   *
   * @param methodName
   * @param method
   * @param obj
   * @param context
   * @param isJsonCreator
   */
  private parseMethodArguments(methodName: string,
                               method: any,
                               obj: any,
                               context: JsonParserTransformerContext,
                               argNames: string[],
                               isJsonCreator: boolean): {
      args: Array<any>;
      argNames: Array<string>;
      argNamesAliasToBeExcluded: Array<string>;
    } {
    const currentMainCreator = context.mainCreator[0];
    const args = [];
    argNames = (method) ? getArgumentNames(method) : argNames;
    argNames = mapVirtualPropertiesToClassProperties(currentMainCreator, argNames, {checkSetters: true});

    const argNamesAliasToBeExcluded = [];

    for (let argIndex = 0; argIndex < argNames.length; argIndex++) {
      const key = argNames[argIndex];

      const hasJsonIgnore =
        hasMetadata('jackson:JsonIgnoreParam:' + argIndex, currentMainCreator, methodName, context);
      const isIncludedByJsonView = this.parseIsIncludedByJsonViewParam(context, methodName, argIndex);

      if (hasJsonIgnore || !isIncludedByJsonView) {
        args.push(null);
        continue;
      }

      const jsonInject: JsonInjectOptions =
        getMetadata('jackson:JsonInjectParam:' + argIndex, currentMainCreator, methodName, context);

      if (!jsonInject || (jsonInject && jsonInject.useInput)) {
        const jsonProperty: JsonPropertyOptions =
          getMetadata('jackson:JsonPropertyParam:' + argIndex, currentMainCreator, methodName, context);

        let mappedKey: string = jsonProperty != null ? jsonProperty.value : null;
        if (!mappedKey) {
          const jsonAlias: JsonAliasOptions =
            getMetadata('jackson:JsonAliasParam:' + argIndex, currentMainCreator, methodName, context);

          if (jsonAlias && jsonAlias.values) {
            mappedKey = jsonAlias.values.find((alias) => Object.hasOwnProperty.call(obj, alias));
          }
        }

        if (mappedKey && Object.hasOwnProperty.call(obj, mappedKey)) {
          args.push(this.parseJsonClass(context, obj, mappedKey, methodName, argIndex));
          argNamesAliasToBeExcluded.push(mappedKey);
        } else if (mappedKey && jsonProperty.required) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Required property "${mappedKey}" not found on parameter at index ${argIndex} of ${currentMainCreator.name}.${methodName} at [Source '${JSON.stringify(obj)}']`);
        } else if (Object.hasOwnProperty.call(obj, key)) {
          args.push(this.parseJsonClass(context, obj, key, methodName, argIndex));
        } else {
          if (isJsonCreator && context.features.deserialization[DeserializationFeature.FAIL_ON_MISSING_CREATOR_PROPERTIES]) {
            // eslint-disable-next-line max-len
            throw new JacksonError(`Missing @JsonCreator() parameter at index ${argIndex} of ${currentMainCreator.name}.${methodName} at [Source '${JSON.stringify(obj)}']`);
          }
          args.push(jsonInject ? context.injectableValues[jsonInject.value] : null);
        }

      } else {
        // force argument value to use options.injectableValues
        args.push(jsonInject ? context.injectableValues[jsonInject.value] : null);
      }
    }

    if (isJsonCreator && context.features.deserialization[DeserializationFeature.FAIL_ON_NULL_CREATOR_PROPERTIES]) {
      const argsLength = args.length;
      for (let i = 0; i < argsLength; i++) {
        const arg = args[i];
        if (arg == null) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Found "${arg}" value on @JsonCreator() parameter at index ${i} of ${currentMainCreator.name}.${methodName} at [Source '${JSON.stringify(obj)}']`);
        }
      }
    }

    return {
      args,
      argNames,
      argNamesAliasToBeExcluded
    };
  }

  /**
   *
   * @param replacement
   * @param context
   */
  private parseJsonVirtualPropertyAndJsonAlias(replacement: any, context: JsonParserTransformerContext): void {
    const currentMainCreator = context.mainCreator[0];
    // convert JsonProperty to Class properties
    const creatorMetadataKeys = getMetadataKeys(currentMainCreator, context);

    for (const metadataKey of creatorMetadataKeys) {
      if (metadataKey.startsWith('jackson:JsonVirtualProperty:') || metadataKey.startsWith('jackson:JsonAlias:')) {

        const realKey = metadataKey.replace(
          metadataKey.startsWith('jackson:JsonVirtualProperty:') ? 'jackson:JsonVirtualProperty:' : 'jackson:JsonAlias:', '');
        const jsonVirtualProperty: JsonPropertyPrivateOptions | JsonSetterPrivateOptions =
          getMetadata(metadataKey, currentMainCreator, null, context);

        if (jsonVirtualProperty && jsonVirtualProperty.descriptor != null &&
          typeof jsonVirtualProperty.descriptor.value === 'function' &&
          jsonVirtualProperty.propertyKey.startsWith('get')) {
          continue;
        }

        const jsonAlias: JsonAliasOptions =
          getMetadata(metadataKey, currentMainCreator, null, context);

        const isIgnored =
          jsonVirtualProperty && 'access' in jsonVirtualProperty && jsonVirtualProperty.access === JsonPropertyAccess.READ_ONLY;

        if (jsonVirtualProperty && !isIgnored) {
          if (Object.hasOwnProperty.call(replacement, jsonVirtualProperty.value)) {
            replacement[realKey] = replacement[jsonVirtualProperty.value];
            if (realKey !== jsonVirtualProperty.value) {
              delete replacement[jsonVirtualProperty.value];
            }
          } else if ('required' in jsonVirtualProperty && jsonVirtualProperty.required) {
            // eslint-disable-next-line max-len
            throw new JacksonError(`Required property "${jsonVirtualProperty.value}" not found at [Source '${JSON.stringify(replacement)}']`);
          }
        }
        if (jsonAlias && jsonAlias.values && !isIgnored) {
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
        if (isIgnored) {
          delete replacement[realKey];
        }
      }
    }
  }

  /**
   *
   * @param context
   * @param replacement
   * @param key
   */
  private parseJsonRawValue(context: JsonParserTransformerContext, replacement: any, key: string): void {
    const jsonRawValue =
      hasMetadata('jackson:JsonRawValue', context.mainCreator[0], key, context);
    if (jsonRawValue) {
      replacement[key] = JSON.stringify(replacement[key]);
    }
  }

  /**
   *
   * @param replacement
   * @param context
   */
  private parseJsonRootName(replacement: any, context: JsonParserTransformerContext): any {
    const jsonRootName: JsonRootNameOptions =
      getMetadata('jackson:JsonRootName', context.mainCreator[0], null, context);
    if (jsonRootName && jsonRootName.value) {
      return replacement[jsonRootName.value];
    }
    return replacement;
  }

  /**
   *
   * @param context
   * @param obj
   * @param key
   * @param methodName
   * @param argumentIndex
   */
  private parseJsonClass(context: JsonParserTransformerContext, obj: any, key: string,
                         methodName?: string, argumentIndex?: number): any {
    let jsonClass: JsonClassOptions;
    if (methodName != null && argumentIndex != null) {
      jsonClass =
        getMetadata('jackson:JsonClassParam:' + argumentIndex, context.mainCreator[0], methodName, context);
    }
    if (!jsonClass) {
      // if @JsonClass() is not found at parameter level, try to get it from the class properties
      jsonClass = getMetadata('jackson:JsonClass', context.mainCreator[0], key, context);
    }
    this.propagateDecorators(jsonClass, obj, key, context, methodName, argumentIndex);

    const newContext = cloneDeep(context);

    if (jsonClass && jsonClass.class) {
      newContext.mainCreator = jsonClass.class();
      this._addInternalDecoratorsFromJsonClass(newContext.mainCreator, newContext);
      if (obj[key] == null) {
        return obj[key];
      }

      const newCreator = newContext.mainCreator[0];

      if (isClassIterableNoMapNoString(newCreator)) {
        return this.parseIterable(obj[key], key, newContext);
      }
    } else {
      const newCreator = (obj[key] != null) ? obj[key].constructor : Object;
      newContext.mainCreator = [newCreator];
    }
    return this.deepTransform(key, obj[key], newContext);
  }

  /**
   *
   * @param mainCreator
   * @param context
   * @private
   */
  private _addInternalDecoratorsFromJsonClass(mainCreator: any[], context: JsonParserTransformerContext) {
    for (let i = 0; i < mainCreator.length; i++) {
      const ctor = mainCreator[i];
      if (!(ctor instanceof Array)) {
        if (!ctor.name && typeof ctor === 'function') {
          const decoratorsToBeApplied = {
            depth: 1
          };
          const result = (ctor as ClassTypeWithDecoratorDefinitions)();
          mainCreator[i] = result.target;
          const decorators = result.decorators;
          for (const decorator of decorators) {
            decoratorsToBeApplied['jackson:' + decorator.name] = {
              enabled: true,
              ...decorator.options
            } as JsonDecoratorOptions;
          }
          context._internalDecorators.set(result.target, decoratorsToBeApplied);
        }
      } else {
        this._addInternalDecoratorsFromJsonClass(ctor, context);
      }
    }
  }

  /**
   *
   * @param replacement
   * @param context
   * @param obj
   * @param key
   */
  private parseJsonManagedReference(replacement: any, context: JsonParserTransformerContext, obj: any, key: string): void {
    const currentMainCreator = context.mainCreator[0];

    let jsonManagedReference: JsonManagedReferenceOptions =
      getMetadata('jackson:JsonManagedReference', currentMainCreator, key, context);
    let jsonClassManagedReference: JsonClassOptions =
      getMetadata('jackson:JsonClass', currentMainCreator, key, context);

    if (!jsonManagedReference) {
      const propertySetter = mapVirtualPropertyToClassProperty(currentMainCreator, key, {checkSetters: true});
      jsonManagedReference =
        getMetadata('jackson:JsonManagedReference', currentMainCreator, propertySetter, context);
      jsonClassManagedReference =
        getMetadata('jackson:JsonClassParam:0', currentMainCreator, propertySetter, context);

      if (jsonManagedReference && !jsonClassManagedReference) {
        // eslint-disable-next-line max-len
        throw new JacksonError(`Missing mandatory @JsonClass() decorator for the parameter at index 0 of @JsonManagedReference() decorated ${replacement.constructor.name}.${propertySetter}() method at [Source '${JSON.stringify(obj)}']`);
      }
    }

    if (jsonManagedReference && jsonClassManagedReference) {

      const jsonClassConstructors =  jsonClassManagedReference.class();
      const childConstructor = jsonClassConstructors[0];
      if (isClassIterable(childConstructor)) {
        const backReferenceConstructor = (jsonClassConstructors.length === 1) ?
          Object :
          (
            (!isSameConstructorOrExtensionOfNoObject(childConstructor, Map)) ?
              jsonClassManagedReference.class()[1][0] :
              jsonClassManagedReference.class()[1][1]
          );

        const jsonBackReference: JsonBackReferencePrivateOptions =
          getMetadata('jackson:JsonBackReference:' + jsonManagedReference.value,
            backReferenceConstructor, null, context);

        if (jsonBackReference) {
          if (isSameConstructorOrExtensionOfNoObject(childConstructor, Map)) {
            for (const [k, value] of replacement[key]) {
              if (typeof value[jsonBackReference.propertyKey] === 'function') {
                value[jsonBackReference.propertyKey](replacement);
              } else {
                value[jsonBackReference.propertyKey] = replacement;
              }
            }
          } else {
            for (const value of replacement[key]) {
              if (typeof value[jsonBackReference.propertyKey] === 'function') {
                value[jsonBackReference.propertyKey](replacement);
              } else {
                value[jsonBackReference.propertyKey] = replacement;
              }
            }
          }
        }
      } else {
        const jsonBackReference: JsonBackReferencePrivateOptions =
          getMetadata('jackson:JsonBackReference:' + jsonManagedReference.value,
            childConstructor, null, context);
        if (jsonBackReference) {
          if (typeof replacement[key][jsonBackReference.propertyKey] === 'function') {
            replacement[key][jsonBackReference.propertyKey](replacement);
          } else {
            replacement[key][jsonBackReference.propertyKey] = replacement;
          }
        }
      }
    } else if (jsonManagedReference && !jsonClassManagedReference) {
      // eslint-disable-next-line max-len
      throw new JacksonError(`Missing mandatory @JsonClass() decorator for the @JsonManagedReference() decorated ${replacement.constructor.name}["${key}"] field at [Source '${JSON.stringify(obj)}']`);
    }
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param key
   * @param context
   */
  private parseJsonAnySetter(replacement: any, obj: any, key: string, context: JsonParserTransformerContext): void {
    const jsonAnySetter: JsonAnySetterPrivateOptions =
      getMetadata('jackson:JsonAnySetter', replacement.constructor, null, context);
    if (jsonAnySetter && replacement[jsonAnySetter.propertyKey]) {
      if (typeof replacement[jsonAnySetter.propertyKey] === 'function') {
        replacement[jsonAnySetter.propertyKey](key, obj[key]);
      } else {
        replacement[jsonAnySetter.propertyKey][key] = obj[key];
      }
    }
  }

  /**
   *
   * @param context
   * @param replacement
   */
  private parseJsonDeserializeClass(replacement: any, context: JsonParserTransformerContext): any {
    const jsonDeserialize: JsonDeserializeOptions =
      getMetadata('jackson:JsonDeserialize', context.mainCreator[0], null, context);
    if (jsonDeserialize && jsonDeserialize.using) {
      return jsonDeserialize.using(replacement, context);
    }
    return replacement;
  }

  /**
   *
   * @param context
   * @param replacement
   * @param key
   */
  private parseJsonDeserializeProperty(key: string, replacement: any, context: JsonParserTransformerContext): void {
    const currentMainCreator = context.mainCreator[0];

    const jsonDeserialize: JsonDeserializeOptions =
      getMetadata('jackson:JsonDeserialize', currentMainCreator, key, context);
    if (jsonDeserialize && jsonDeserialize.using) {
      replacement[key] = jsonDeserialize.using(replacement[key], context);
    }
  }

  /**
   *
   * @param context
   * @param key
   */
  private parseHasJsonIgnore(context: JsonParserTransformerContext, key: string): boolean {
    const currentMainCreator = context.mainCreator[0];

    const hasJsonIgnore =
      hasMetadata('jackson:JsonIgnore', currentMainCreator, key, context);

    if (!hasJsonIgnore) {
      const jsonIgnoreProperties: JsonIgnorePropertiesOptions =
        getMetadata('jackson:JsonIgnoreProperties', currentMainCreator, null, context);
      if (jsonIgnoreProperties) {
        const jsonVirtualProperty: JsonPropertyPrivateOptions | JsonGetterPrivateOptions =
          getMetadata('jackson:JsonVirtualProperty:' + key, currentMainCreator, null, context);

        if (jsonVirtualProperty && jsonIgnoreProperties.value.includes(jsonVirtualProperty.value)) {
          if (jsonVirtualProperty.descriptor != null && typeof jsonVirtualProperty.descriptor.value === 'function' &&
            jsonIgnoreProperties.allowSetters) {
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
   * @param context
   */
  private parseJsonIgnoreType(context: JsonParserTransformerContext): boolean {
    return hasMetadata('jackson:JsonIgnoreType', context.mainCreator[0], null, context);
  }

  /**
   *
   * @param obj
   * @param context
   */
  private parseJsonTypeInfo(obj: any, context: JsonParserTransformerContext): any {
    const currentMainCreator = context.mainCreator[0];
    const jsonTypeInfo: JsonTypeInfoOptions =
      getMetadata('jackson:JsonTypeInfo', currentMainCreator, null, context);

    if (jsonTypeInfo) {
      let jsonTypeCtor: ClassType<any>;
      let jsonTypeInfoProperty: string;
      let newObj = obj;

      switch (jsonTypeInfo.include) {
      case JsonTypeInfoAs.PROPERTY:
        jsonTypeInfoProperty = obj[jsonTypeInfo.property];
        if (jsonTypeInfoProperty == null) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Missing type id when trying to resolve subtype of class ${currentMainCreator.name}: missing type id property '${jsonTypeInfo.property}' at [Source '${JSON.stringify(obj)}']`);
        }
        delete obj[jsonTypeInfo.property];
        break;
      case JsonTypeInfoAs.WRAPPER_OBJECT:
        if (!(obj instanceof Object) || obj instanceof Array) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Expected "Object", got "${obj.constructor.name}": need JSON Object to contain JsonTypeInfoAs.WRAPPER_OBJECT type information for class "${currentMainCreator.name}" at [Source '${JSON.stringify(obj)}']`);
        }
        jsonTypeInfoProperty = Object.keys(obj)[0];
        newObj = obj[jsonTypeInfoProperty];
        break;
      case JsonTypeInfoAs.WRAPPER_ARRAY:
        if (!(obj instanceof Array)) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Expected "Array", got "${obj.constructor.name}": need JSON Array to contain JsonTypeInfoAs.WRAPPER_ARRAY type information for class "${currentMainCreator.name}" at [Source '${JSON.stringify(obj)}']`);
        } else if (obj.length > 2 || obj.length === 0) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Expected "Array" of length 1 or 2, got "Array" of length ${obj.length}: need JSON Array of length 1 or 2 to contain JsonTypeInfoAs.WRAPPER_ARRAY type information for class "${currentMainCreator.name}" at [Source '${JSON.stringify(obj)}']`);
        } else if (obj[0] == null || obj[0].constructor !== String) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Expected "String", got "${obj[0] ? obj[0].constructor.name : obj[0]}": need JSON String that contains type id (for subtype of "${currentMainCreator.name}") at [Source '${JSON.stringify(obj)}']`);
        }
        jsonTypeInfoProperty = obj[0];
        newObj = obj[1];
        break;
      }

      const jsonTypeIdResolver: JsonTypeIdResolverOptions =
        getMetadata('jackson:JsonTypeIdResolver', currentMainCreator, null, context);
      if (jsonTypeIdResolver && jsonTypeIdResolver.resolver) {
        jsonTypeCtor = jsonTypeIdResolver.resolver.typeFromId(jsonTypeInfoProperty, context);
      }

      const jsonSubTypes: JsonSubTypesOptions =
        getMetadata('jackson:JsonSubTypes', currentMainCreator, null, context);

      if (!jsonTypeCtor) {
        if (jsonSubTypes && jsonSubTypes.types && jsonSubTypes.types.length > 0) {
          for (const subType of jsonSubTypes.types) {
            const subTypeClass = subType.class() as ObjectConstructor;
            if ( (subType.name != null && jsonTypeInfoProperty === subType.name) ||
              jsonTypeInfoProperty === subTypeClass.name) {
              jsonTypeCtor = subTypeClass;
            }
          }
          if (!jsonTypeCtor) {
            const ids = [(currentMainCreator).name];
            ids.push(...jsonSubTypes.types.map((subType) => (subType.name) ? subType.name : subType.class().name));
            // eslint-disable-next-line max-len
            throw new JacksonError(`Could not resolve type id "${jsonTypeInfoProperty}" as a subtype of "${currentMainCreator.name}": known type ids = [${ids.join(', ')}] at [Source '${JSON.stringify(obj)}']`);
          }
        }
      }

      if (!jsonTypeCtor) {
        jsonTypeCtor = currentMainCreator;
        switch (jsonTypeInfo.use) {
        case JsonTypeInfoId.NAME:
          jsonTypeCtor = currentMainCreator;
          break;
        }
      }

      if (!jsonTypeCtor) {
        const ids = [(currentMainCreator).name];
        if (jsonSubTypes && jsonSubTypes.types && jsonSubTypes.types.length > 0) {
          ids.push(...jsonSubTypes.types.map((subType) => (subType.name) ? subType.name : subType.class().name));
        }
        // eslint-disable-next-line max-len
        throw new JacksonError(`Could not resolve type id "${jsonTypeInfoProperty}" as a subtype of "${currentMainCreator.name}": known type ids = [${ids.join(', ')}] at [Source '${JSON.stringify(obj)}']`);
      }

      context.mainCreator = [jsonTypeCtor];
      return newObj;
    }

    return obj;
  }

  /**
   *
   * @param context
   * @param key
   */
  private parseIsIncludedByJsonViewProperty(context: JsonParserTransformerContext, key: string): boolean {
    const currentMainCreator = context.mainCreator[0];

    if (context.withViews) {
      let jsonView: JsonViewOptions =
        getMetadata('jackson:JsonView', currentMainCreator, key, context);
      if (!jsonView) {
        jsonView = getMetadata('jackson:JsonView', currentMainCreator, null, context);
      }

      if (jsonView && jsonView.value) {
        return this.parseIsIncludedByJsonView(jsonView, context);
      }
    }
    return true;
  }

  /**
   *
   * @param context
   * @param key
   */
  private parseIsIncludedByJsonViewParam(context: JsonParserTransformerContext, methodName: string, argumentIndex: number): boolean {
    const currentMainCreator = context.mainCreator[0];

    if (context.withViews) {
      const jsonView: JsonViewOptions =
        getMetadata('jackson:JsonViewParam:' + argumentIndex, currentMainCreator, methodName, context);

      if (jsonView && jsonView.value) {
        return this.parseIsIncludedByJsonView(jsonView, context);
      }
    }
    return true;
  }

  /**
   *
   * @param jsonView
   * @param context
   */
  private parseIsIncludedByJsonView(jsonView: JsonViewOptions, context: JsonParserTransformerContext): boolean {
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

  /**
   *
   * @param replacement
   * @param context
   */
  private parseJsonUnwrapped(replacement: any, context: JsonParserTransformerContext): void {
    const currentMainCreator = context.mainCreator[0];
    const metadataKeys: string[] = getMetadataKeys(currentMainCreator, context);
    for (const metadataKey of metadataKeys) {
      if (metadataKey.startsWith('jackson:JsonUnwrapped:')) {
        const realKey = metadataKey.replace('jackson:JsonUnwrapped:', '');

        const jsonUnwrapped: JsonUnwrappedPrivateOptions =
          getMetadata(metadataKey, currentMainCreator, null, context);
        if (jsonUnwrapped.descriptor != null &&
          typeof jsonUnwrapped.descriptor.value === 'function' &&
          !realKey.startsWith('set')) {
          continue;
        }

        const jsonClass: JsonClassOptions =
          getMetadata('jackson:JsonClass', currentMainCreator, realKey, context);
        if (!jsonClass) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`@JsonUnwrapped() requires use of @JsonClass() for deserialization at ${currentMainCreator.name}["${realKey}"])`);
        }

        const prefix = (jsonUnwrapped.prefix != null) ? jsonUnwrapped.prefix : '';
        const suffix = (jsonUnwrapped.suffix != null) ? jsonUnwrapped.suffix : '';

        replacement[realKey] = {};

        const properties = getClassProperties(jsonClass.class()[0], null, {
          withJsonVirtualPropertyValues: true,
          withJsonAliases: true
        });
        for (const k of properties) {
          const wrappedKey = prefix + k + suffix;
          if (Object.hasOwnProperty.call(replacement, wrappedKey)) {
            replacement[realKey][k] = replacement[wrappedKey];
            delete replacement[wrappedKey];
          }
        }
      }
    }
  }

  /**
   *
   * @param replacement
   * @param obj
   * @param context
   */
  private parseJsonIdentityInfo(replacement: any, obj: any, context: JsonParserTransformerContext): void {
    const jsonIdentityInfo: JsonIdentityInfoOptions =
      getMetadata('jackson:JsonIdentityInfo', context.mainCreator[0], null, context);

    if (jsonIdentityInfo) {
      const id: string = obj[jsonIdentityInfo.property];
      const scope: string = jsonIdentityInfo.scope || '';
      const scopedId = this.generateScopedId(scope, id);
      if (!this._globalValueAlreadySeen.has(scopedId)) {
        this._globalValueAlreadySeen.set(scopedId, replacement);
      }

      delete obj[jsonIdentityInfo.property];
    }
  }

  /**
   *
   * @param iterable
   * @param key
   * @param context
   */
  private parseIterable(iterable: any, key: string, context: JsonParserTransformerContext): any {
    const jsonDeserialize: JsonDeserializeOptions =
      getMetadata('jackson:JsonDeserialize',
        context._propertyParentCreator,
        key, context);

    const currentCreators = context.mainCreator;
    const currentCreator = currentCreators[0];

    let newIterable: any;
    const newContext = cloneDeep(context);

    if (currentCreators.length > 1 && currentCreators[1] instanceof Array) {
      newContext.mainCreator = currentCreators[1] as [ClassType<any>];
    } else {
      newContext.mainCreator = [Object];
    }

    if (isSameConstructorOrExtensionOfNoObject(currentCreator, Set)) {
      if (isSameConstructor(currentCreator, Set)) {
        newIterable = new Set();
      } else {
        newIterable = new (currentCreator as ObjectConstructor)() as Set<any>;
      }
      for (let value of iterable) {
        if (newContext.mainCreator == null) {
          newContext.mainCreator = [(value != null) ? value.constructor : Object];
        }

        if (jsonDeserialize && jsonDeserialize.contentUsing) {
          value = jsonDeserialize.contentUsing(value, newContext);
        }

        (newIterable as Set<any>).add(this.deepTransform(key, value, newContext));
      }
    } else {
      newIterable = [];
      for (let value of iterable) {
        if (newContext.mainCreator == null) {
          newContext.mainCreator = [(value != null) ? value.constructor : Object];
        }

        if (jsonDeserialize && jsonDeserialize.contentUsing) {
          value = jsonDeserialize.contentUsing(value, newContext);
        }

        (newIterable as Array<any>).push(this.deepTransform(key, value, newContext));
      }
      if (!isSameConstructor(currentCreator, Array)) {
        // @ts-ignore
        newIterable = new currentCreator(...newIterable);
      }
    }

    return newIterable;
  }

  /**
   *
   * @param obj
   * @param context
   */
  private parseMap(key: string, obj: any, context: JsonParserTransformerContext): Map<any, any> {
    const currentCreators = context.mainCreator;
    const currentCreator = currentCreators[0];

    const jsonDeserialize: JsonDeserializeOptions =
      getMetadata('jackson:JsonDeserialize', context._propertyParentCreator, key, context);

    let map: Map<any, any>;

    const newContext = cloneDeep(context);

    if (currentCreators.length > 1 && currentCreators[1] instanceof Array) {
      newContext.mainCreator = currentCreators[1] as [ClassType<any>];
    } else {
      newContext.mainCreator = [Object];
    }

    if (isSameConstructor(currentCreator, Map)) {
      map = new Map();
    } else {
      map = new (currentCreator as ObjectConstructor)() as Map<any, any>;
    }

    let keyNewContext = cloneDeep(newContext);
    let valueNewContext = cloneDeep(newContext);

    const mapCurrentCreators = newContext.mainCreator;
    keyNewContext.mainCreator = [mapCurrentCreators[0]];
    if (mapCurrentCreators.length > 1) {
      if (mapCurrentCreators[1] instanceof Array) {
        valueNewContext.mainCreator = mapCurrentCreators[1] as [ClassType<any>];
      } else {
        valueNewContext.mainCreator = [mapCurrentCreators[1]] as [ClassType<any>];
      }
    } else {
      valueNewContext.mainCreator = [Object];
    }

    keyNewContext = cloneDeep(keyNewContext);
    valueNewContext = cloneDeep(valueNewContext);

    // eslint-disable-next-line guard-for-in
    for (let mapKey in obj) {
      let mapValue = obj[mapKey];
      if (jsonDeserialize && (jsonDeserialize.contentUsing || jsonDeserialize.keyUsing)) {
        mapKey = (jsonDeserialize.keyUsing) ? jsonDeserialize.keyUsing(mapKey, context) : mapKey;
        mapValue = (jsonDeserialize.contentUsing) ?
          jsonDeserialize.contentUsing(mapValue, context) : mapValue;
      }

      map.set(mapKey, this.deepTransform(mapKey, mapValue, valueNewContext));
    }

    return map;
  }

  /**
   *
   * @param scope
   * @param id
   */
  private generateScopedId(scope: string, id: string): string {
    return scope + ': ' + id;
  }

  /**
   *
   * @param obj
   * @param context
   */
  private parseJsonNaming(obj: any, context: JsonParserTransformerContext): void {
    const jsonNamingOptions: JsonNamingOptions =
      getMetadata('jackson:JsonNaming', context.mainCreator[0], null, context);
    if (jsonNamingOptions && jsonNamingOptions.strategy != null) {
      const keys = Object.keys(obj);
      const classProperties = new Set<string>(getClassProperties(context.mainCreator[0], null, {
        withSetterVirtualProperties: true
      }));

      const keysLength = keys.length;
      for (let i = 0; i < keysLength; i++) {
        const key = keys[i];
        let oldKey = key;
        switch (jsonNamingOptions.strategy) {
        case PropertyNamingStrategy.KEBAB_CASE:
          oldKey = key.replace(/-/g, '');
          break;
        case PropertyNamingStrategy.LOWER_DOT_CASE:
          oldKey = key.replace(/\./g, '');
          break;
        case PropertyNamingStrategy.LOWER_CAMEL_CASE:
        case PropertyNamingStrategy.LOWER_CASE:
        case PropertyNamingStrategy.UPPER_CAMEL_CASE:
          break;
        }

        let propertyFound = false;
        classProperties.forEach((propertyKey) => {
          if (propertyKey.toLowerCase() === oldKey.toLowerCase()) {
            oldKey = propertyKey;
            propertyFound = true;
            return;
          }
        });
        if (!propertyFound && jsonNamingOptions.strategy === PropertyNamingStrategy.SNAKE_CASE) {
          classProperties.forEach((propertyKey) => {
            const tokens = propertyKey.split(/(?=[A-Z])/);
            const tokensLength = tokens.length;
            let reconstructedKey  = '';
            for (let j = 0; j < tokensLength; j++) {
              const token = tokens[j].toLowerCase();
              const separator = (j > 0 && tokens[j - 1].endsWith('_')) ? '' : '_';
              reconstructedKey += (reconstructedKey !== '' && token.length > 1) ? separator + token : token;
            }
            if (key === reconstructedKey) {
              oldKey = propertyKey;
              return;
            }
          });
        }

        classProperties.delete(oldKey);

        if (oldKey != null && oldKey !== key) {
          oldKey = mapVirtualPropertyToClassProperty(context.mainCreator[0], oldKey, {checkSetters: true});
          obj[oldKey] = obj[key];
          delete obj[key];
        }
      }
    }
  }
}
