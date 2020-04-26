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
  isConstructorPrimitiveType,
  isFloat,
  isIterableNoMapNoString,
  isSameConstructor,
  isSameConstructorOrExtensionOf,
  isSameConstructorOrExtensionOfNoObject, makeMetadataKeysWithContext,
  mapClassPropertyToVirtualProperty,
  mapVirtualPropertiesToClassProperties,
  mapVirtualPropertyToClassProperty
} from '../util';
import {
  ClassType,
  ClassTypeWithDecoratorDefinitions,
  JsonAliasOptions,
  JsonAppendOptions,
  JsonClassTypeOptions,
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
  JsonSubTypesOptions,
  JsonTypeIdResolverOptions,
  JsonTypeInfoOptions,
  JsonViewOptions
} from '../@types';
import {JsonPropertyAccess} from '../decorators/JsonProperty';
import {JsonTypeInfoAs, JsonTypeInfoId} from '../decorators/JsonTypeInfo';
import {JacksonError} from './JacksonError';
import {
  InternalDecorators,
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
import * as clone from 'lodash.clone';
import {JsonSetterNulls} from '../decorators/JsonSetter';
import {DefaultDeserializationFeatureValues} from '../databind/DeserializationFeature';

/**
 * JsonParser provides functionality for reading JSON.
 * It is also highly customizable to work both with different styles of JSON content,
 * and to support more advanced Object concepts such as polymorphism and Object identity.
 */
export class JsonParser<T> {

  /**
   * Map used to restore object circular references defined by {@link JsonIdentityInfo}.
   */
  private _globalValueAlreadySeen = new Map<string, any>();

  /**
   * Map used to store unresolved object identities defined by {@link JsonIdentityInfo}.
   */
  private _globalUnresolvedObjectIdentities = new Set<string>();

  /**
   *
   */
  constructor() {
  }

  /**
   * Method for deserializing a JSON string into a JavaScript object or value.
   *
   * @param text - the JSON string to be deserialized.
   * @param context - the context to be used during deserialization.
   */
  parse(text: string, context: JsonParserContext = {}): T {
    const value = JSON.parse(text);
    const result = this.transform(value, context);
    return result;
  }

  /**
   * Method for applying json decorators to a JavaScript object/value parsed.
   * It returns a JavaScript object/value with json decorators applied.
   *
   * @param value - the JavaScript object or value to be postprocessed.
   * @param context - the context to be used during deserialization postprocessing.
   */
  transform(value: any, context: JsonParserContext = {}): any {
    let newContext: JsonParserTransformerContext = this.convertParserContextToTransformerContext(context);

    newContext.mainCreator = (newContext.mainCreator && newContext.mainCreator[0] !== Object) ?
      newContext.mainCreator : [(value != null) ? value.constructor : Object];
    newContext._propertyParentCreator = newContext.mainCreator[0];
    newContext._internalDecorators = new Map();
    newContext = cloneDeep(newContext);

    const result = this.deepTransform('', value, newContext);
    if (this._globalUnresolvedObjectIdentities.size > 0 &&
      newContext.features.deserialization.FAIL_ON_UNRESOLVED_OBJECT_IDS) {
      throw new JacksonError(`Found unresolved Object Ids: ${[...this._globalUnresolvedObjectIdentities].join(', ')}`);
    }
    return result;
  }

  /**
   * Recursive {@link JsonParser.transform}.
   *
   * @param key - key name representing the object property being postprocessed.
   * @param value - the JavaScript object or value to postprocessed.
   * @param context - the context to be used during deserialization postprocessing.
   */
  private deepTransform(key: string, value: any, context: JsonParserTransformerContext): any {
    context = {
      withContextGroups: [],
      features: {
        deserialization: DefaultDeserializationFeatureValues
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

    const currentMainCreator = context.mainCreator[0];

    value = this.invokeCustomDeserializers(key, value, context);
    value = this.parseJsonDeserializeClass(value, context);

    if (value != null && context.features.deserialization.ALLOW_COERCION_OF_SCALARS) {
      if (value.constructor === String) {
        if (isSameConstructorOrExtensionOfNoObject(currentMainCreator, Number)) {
          value = +value;
        } else if (BigInt && isSameConstructorOrExtensionOfNoObject(currentMainCreator, BigInt)) {
          value = BigInt(+value);
        } else if (isSameConstructorOrExtensionOfNoObject(currentMainCreator, Boolean)) {
          if (value.toLowerCase() === 'true' || value === '1') {
            value = true;
          } else if (value.toLowerCase() === 'false' || value === '0') {
            value = false;
          } else {
            value = !!value;
          }
        }
      } else if (value.constructor === Number) {
        if (isSameConstructorOrExtensionOfNoObject(currentMainCreator, Boolean)) {
          value = !!value;
        } else if (BigInt && isSameConstructorOrExtensionOfNoObject(currentMainCreator, BigInt)) {
          value = BigInt(+value);
        } else if (isSameConstructorOrExtensionOfNoObject(currentMainCreator, String)) {
          value += '';
        }
      } else if (value.constructor === Boolean) {
        if (isSameConstructorOrExtensionOfNoObject(currentMainCreator, Number)) {
          value = value ? 1 : 0;
        } else if (BigInt && isSameConstructorOrExtensionOfNoObject(currentMainCreator, BigInt)) {
          value = BigInt(value ? 1 : 0);
        } else if (isSameConstructorOrExtensionOfNoObject(currentMainCreator, String)) {
          value += '';
        }
      }
    }

    if (value == null && isConstructorPrimitiveType(context.mainCreator[0])) {
      value = this.getDefaultValue(context);
    }

    if (value == null && context.features.deserialization.FAIL_ON_NULL_FOR_PRIMITIVES &&
      isConstructorPrimitiveType(currentMainCreator)) {
      // eslint-disable-next-line max-len
      throw new JacksonError(`Cannot map "${value}" into primitive type ${(currentMainCreator as ObjectConstructor).name}` +
        ( (context._propertyParentCreator != null && context._propertyParentCreator !== Object && key !== '') ?
          ` for ${context._propertyParentCreator.name}["${key}"]` :
          (key !== '' ? ' for property ' + key : '') ));
    }

    if ( (value instanceof Array && value.length === 0 &&
      context.features.deserialization.ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT) ||
      (value != null && value.constructor === String && value.length === 0 &&
        context.features.deserialization.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT) ) {
      value = null;
    }

    // if (value != null && value.constructor === Number &&
    //   context.features.deserialization.ACCEPT_FLOAT_AS_INT && isFloat(value)) {
    //   value = parseInt(value + '', 10);
    // }

    if (value != null) {

      let instance = this.getInstanceAlreadySeen(key, value, context);
      if (instance !== undefined) {
        return instance;
      }

      value = this.parseJsonTypeInfo(value, context);

      if (isSameConstructorOrExtensionOfNoObject(currentMainCreator, Map) ||
          (typeof value === 'object' && !isIterableNoMapNoString(value) && currentMainCreator === Object)) {
        return this.parseMapAndObjLiteral(key, value, context);
      } else if (BigInt && isSameConstructorOrExtensionOfNoObject(currentMainCreator, BigInt)) {
        return (value != null && value.constructor === String && value.endsWith('n')) ?
          // @ts-ignore
          currentMainCreator(value.substring(0, value.length - 1)) :
          // @ts-ignore
          currentMainCreator(value);
      } else if (isSameConstructorOrExtensionOfNoObject(currentMainCreator, RegExp)) {
        // @ts-ignore
        return new currentMainCreator(value);
      } else if (isSameConstructorOrExtensionOfNoObject(currentMainCreator, Date)) {
        // @ts-ignore
        return new currentMainCreator(value);
      } else if (typeof value === 'object' && !isIterableNoMapNoString(value)) {

        if (this.parseJsonIgnoreType(context)) {
          return null;
        }

        let replacement = clone(value);
        replacement = this.parseJsonRootName(replacement, context);

        this.parseJsonUnwrapped(replacement, context);
        this.parseJsonVirtualPropertyAndJsonAlias(replacement, context);
        this.parseJsonNaming(replacement, context);

        let keys = Object.keys(replacement);
        if (context.features.deserialization.ACCEPT_CASE_INSENSITIVE_PROPERTIES) {
          const classProperties = getClassProperties(currentMainCreator, null, context);
          const caseInsesitiveKeys = keys.map((k) => k.toLowerCase());
          for (const classProperty of classProperties) {
            const index = caseInsesitiveKeys.indexOf(classProperty.toLowerCase());
            if (index >= 0) {
              replacement[classProperty] = replacement[keys[index]];
              delete replacement[keys[index]];
              keys[index] = classProperty;
            }
          }
        }
        keys = mapVirtualPropertiesToClassProperties(currentMainCreator, keys, context, {checkSetters: true});

        const classPropertiesToBeExcluded: string[] = [];

        for (const k of keys) {
          if (classHasOwnProperty(currentMainCreator, k, replacement, context, {withSettersAsProperty: true})) {
            const jsonClass: JsonClassTypeOptions = getMetadata('JsonClassType', context.mainCreator[0], k, context);
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
      (context.features.deserialization.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL ||
        context.features.deserialization.SET_DEFAULT_VALUE_FOR_STRING_ON_NULL) ) {
      defaultValue = getDefaultPrimitiveTypeValue(String);
    } else if (currentMainCreator === Number &&
      (context.features.deserialization.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL ||
        context.features.deserialization.SET_DEFAULT_VALUE_FOR_NUMBER_ON_NULL) ) {
      defaultValue = getDefaultPrimitiveTypeValue(Number);
    } else if (currentMainCreator === Boolean &&
      (context.features.deserialization.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL ||
        context.features.deserialization.SET_DEFAULT_VALUE_FOR_BOOLEAN_ON_NULL) ) {
      defaultValue = getDefaultPrimitiveTypeValue(Boolean);
    } else if (BigInt && currentMainCreator === BigInt &&
      (context.features.deserialization.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL ||
        context.features.deserialization.SET_DEFAULT_VALUE_FOR_BIGINT_ON_NULL) ) {
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
  private propagateDecorators(jsonClass: JsonClassTypeOptions,
                              obj: any,
                              key: string,
                              context: JsonParserTransformerContext,
                              methodName?: string,
                              argumentIndex?: number): void {
    const currentMainCreator = context.mainCreator[0];

    // Decorators list that can be propagated
    const metadataKeysForDeepestClass = [
      'JsonIgnoreProperties',
      'JsonIgnorePropertiesParam:' + argumentIndex,
      'JsonTypeInfo',
      'JsonTypeInfoParam:' + argumentIndex,
      'JsonSubTypes',
      'JsonSubTypesParam:' + argumentIndex,
      'JsonTypeIdResolver',
      'JsonTypeIdResolverParam:' + argumentIndex,
      'JsonIdentityInfo',
      'JsonIdentityInfoParam:' + argumentIndex
    ];

    const metadataKeysForFirstClass = [
      'JsonDeserializeParam:' + argumentIndex
    ];

    let deepestClass = null;
    const decoratorsNameFoundForDeepestClass: string[] = [];
    const decoratorsToBeAppliedForDeepestClass: InternalDecorators = {
      depth: 1
    };

    let firstClass = null;
    const decoratorsNameFoundForFirstClass: string[] = [];
    const decoratorsToBeAppliedForFirstClass: InternalDecorators = {
      depth: 1
    };

    if (jsonClass) {
      firstClass = jsonClass.type()[0];
      deepestClass = getDeepestClass(jsonClass.type());
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
          const jsonClassParam: JsonClassTypeOptions =
            getMetadata('JsonClassTypeParam:' + argumentIndex, currentMainCreator, methodName, context);

          const metadataKeysWithContext =
            makeMetadataKeysWithContext(metadataKey.substring(0, metadataKey.indexOf('Param:')),
              {contextGroups: jsonDecoratorOptions.contextGroups});
          for (const metadataKeyWithContext of metadataKeysWithContext) {
            decoratorsToBeAppliedForDeepestClass[metadataKeyWithContext] = jsonDecoratorOptions;
          }

          if (jsonClassParam == null) {
            deepestClass = null;
          } else {
            const jsonClassMetadataKeysWithContext =
              makeMetadataKeysWithContext('JsonClassType', {contextGroups: jsonClassParam.contextGroups});
            for (const metadataKeyWithContext of jsonClassMetadataKeysWithContext) {
              decoratorsToBeAppliedForDeepestClass[metadataKeyWithContext] = jsonClassParam;
            }
          }

          decoratorsNameFoundForDeepestClass.push(metadataKey.substring(0, metadataKey.indexOf('Param:')));
        } else {
          const metadataKeysWithContext =
            makeMetadataKeysWithContext(metadataKey, {contextGroups: jsonDecoratorOptions.contextGroups});
          for (const metadataKeyWithContext of metadataKeysWithContext) {
            decoratorsToBeAppliedForDeepestClass[metadataKeyWithContext] = jsonDecoratorOptions;
          }

          decoratorsNameFoundForDeepestClass.push(metadataKey);
        }
      }
    }

    for (const metadataKey of metadataKeysForFirstClass) {
      const jsonDecoratorOptions: JsonDecoratorOptions = (!metadataKey.includes('Param:')) ?
        getMetadata(metadataKey, currentMainCreator, key, context) :
        getMetadata(metadataKey, currentMainCreator, methodName, context);

      if (jsonDecoratorOptions) {
        if (metadataKey.includes('Param:') && firstClass != null && methodName != null && argumentIndex != null) {
          const jsonClassParam: JsonClassTypeOptions =
            getMetadata('JsonClassTypeParam:' + argumentIndex, currentMainCreator, methodName, context);

          const metadataKeysWithContext =
            makeMetadataKeysWithContext(metadataKey.substring(0, metadataKey.indexOf('Param:')),
              {contextGroups: jsonDecoratorOptions.contextGroups});
          for (const metadataKeyWithContext of metadataKeysWithContext) {
            decoratorsToBeAppliedForFirstClass[metadataKeyWithContext] = jsonDecoratorOptions;
          }

          if (jsonClassParam == null) {
            firstClass = null;
          } else {
            const jsonClassMetadataKeysWithContext =
              makeMetadataKeysWithContext('JsonClassType', {contextGroups: jsonClassParam.contextGroups});
            for (const metadataKeyWithContext of jsonClassMetadataKeysWithContext) {
              decoratorsToBeAppliedForFirstClass[metadataKeyWithContext] = jsonClassParam;
            }
          }

          decoratorsNameFoundForFirstClass.push(metadataKey.substring(0, metadataKey.indexOf('Param:')));
        } else {
          const metadataKeysWithContext =
            makeMetadataKeysWithContext(metadataKey, {contextGroups: jsonDecoratorOptions.contextGroups});
          for (const metadataKeyWithContext of metadataKeysWithContext) {
            decoratorsNameFoundForFirstClass[metadataKeyWithContext] = jsonDecoratorOptions;
          }

          decoratorsNameFoundForFirstClass.push(metadataKey);
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
        const virtualProperty = mapClassPropertyToVirtualProperty(currentMainCreator, key, context);
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
  private getInstanceAlreadySeen(key: string, value: any, context: JsonParserTransformerContext): undefined | null | any {
    const currentMainCreator = context.mainCreator[0];
    const jsonIdentityInfo: JsonIdentityInfoOptions =
      getMetadata('JsonIdentityInfo', currentMainCreator, null, context);

    if (jsonIdentityInfo) {
      const id: string = typeof value === 'object' ? value[jsonIdentityInfo.property] : value;

      const scope: string = jsonIdentityInfo.scope || '';
      const scopedId = this.generateScopedId(scope, id);

      if (this._globalValueAlreadySeen.has(scopedId)) {
        const instance = this._globalValueAlreadySeen.get(scopedId);
        if (instance.constructor !== currentMainCreator) {
          throw new JacksonError(`Already had Class "${instance.constructor.name}" for id ${id}.`);
        }
        this._globalUnresolvedObjectIdentities.delete(scopedId);

        return instance;
      } else if (typeof value !== 'object') {
        this._globalUnresolvedObjectIdentities.add(scopedId);
        if (!context.features.deserialization.FAIL_ON_UNRESOLVED_OBJECT_IDS) {
          return null;
        }
      }
    }

    return undefined;
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

      const jsonCreatorMetadataKey = 'JsonCreator:' + ((withCreatorName != null) ? withCreatorName : defaultCreatorName);

      const hasJsonCreator =
        hasMetadata(jsonCreatorMetadataKey, currentMainCreator, null, context);

      const jsonCreator: JsonCreatorPrivateOptions | ClassType<any> = (hasJsonCreator) ?
        getMetadata(jsonCreatorMetadataKey, currentMainCreator, null, context) :
        currentMainCreator;

      const jsonIgnoreProperties: JsonIgnorePropertiesOptions =
        getMetadata('JsonIgnoreProperties', currentMainCreator, null, context);

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
        getMetadata('JsonAppend', currentMainCreator, null, context);
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

        const classKeys = getClassProperties(currentMainCreator, obj, context, {
          withSettersAsProperty: true
        });

        const remainingKeys = classKeys.filter(k => Object.hasOwnProperty.call(obj, k) && !keysToBeExcluded.includes(k));

        const hasJsonAnySetter =
          hasMetadata('JsonAnySetter', currentMainCreator, null, context);
        // add remaining properties and ignore the ones that are not part of "instance"
        for (const key of remainingKeys) {
          const jsonVirtualProperty: JsonPropertyPrivateOptions | JsonSetterPrivateOptions =
            getMetadata('JsonVirtualProperty:' + key, currentMainCreator, null, context);

          if (jsonVirtualProperty && jsonVirtualProperty.descriptor != null) {
            if (typeof jsonVirtualProperty.descriptor.value === 'function' || jsonVirtualProperty.descriptor.set != null) {
              this.parseJsonSetter(instance, obj, key, context);
            } else {
              // if property has a descriptor but is not a function and doesn't have a setter,
              // then this property has only getter, so we can skip it.
              continue;
            }
          } else if ((Object.hasOwnProperty.call(obj, key) && classHasOwnProperty(currentMainCreator, key, null, context)) ||
            currentMainCreator.name === 'Object') {
            instance[key] = this.parseJsonClassType(context, obj, key);
          } else if (hasJsonAnySetter && Object.hasOwnProperty.call(obj, key)) {
            // for any other unrecognized properties found
            this.parseJsonAnySetter(instance, obj, key, context);
          } else if (!classHasOwnProperty(currentMainCreator, key, null, context) &&
            ( (jsonIgnoreProperties == null && context.features.deserialization.FAIL_ON_UNKNOWN_PROPERTIES) ||
              (jsonIgnoreProperties != null && !jsonIgnoreProperties.ignoreUnknown)) ) {
            // eslint-disable-next-line max-len
            throw new JacksonError(`Unknown property "${key}" for ${currentMainCreator.name} at [Source '${JSON.stringify(obj)}']`);
          }
        }
      }

      const classProperties = getClassProperties(currentMainCreator, null, context);

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
      getMetadata('JsonInject', currentMainCreator, key, context);
    if (!jsonInject) {
      propertySetter = mapVirtualPropertyToClassProperty(currentMainCreator, key, context, {checkSetters: true});
      jsonInject = getMetadata('JsonInject', currentMainCreator, propertySetter, context);
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
      getMetadata('JsonVirtualProperty:' + key, currentMainCreator, null, context);

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
        parsedValue = this.parseJsonClassType(context, obj, key);
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

    if (context.features.deserialization.ACCEPT_CASE_INSENSITIVE_PROPERTIES) {
      const objKeys = Object.keys(obj);
      const caseInsesitiveObjKeys = objKeys.map((k) => k.toLowerCase());
      for (const argName of argNames) {
        const index = caseInsesitiveObjKeys.indexOf(argName.toLowerCase());
        if (index >= 0) {
          obj[argName] = obj[objKeys[index]];
          delete obj[objKeys[index]];
          objKeys[index] = argName;
        }
      }
    }

    argNames = mapVirtualPropertiesToClassProperties(currentMainCreator, argNames, context, {checkSetters: true});

    const argNamesAliasToBeExcluded = [];

    for (let argIndex = 0; argIndex < argNames.length; argIndex++) {
      const key = argNames[argIndex];

      const hasJsonIgnore =
        hasMetadata('JsonIgnoreParam:' + argIndex, currentMainCreator, methodName, context);
      const isIncludedByJsonView = this.parseIsIncludedByJsonViewParam(context, methodName, argIndex);

      if (hasJsonIgnore || !isIncludedByJsonView) {
        args.push(null);
        continue;
      }

      const jsonInject: JsonInjectOptions =
        getMetadata('JsonInjectParam:' + argIndex, currentMainCreator, methodName, context);

      if (!jsonInject || (jsonInject && jsonInject.useInput)) {
        const jsonProperty: JsonPropertyOptions =
          getMetadata('JsonPropertyParam:' + argIndex, currentMainCreator, methodName, context);

        let mappedKey: string = jsonProperty != null ? jsonProperty.value : null;
        if (!mappedKey) {
          const jsonAlias: JsonAliasOptions =
            getMetadata('JsonAliasParam:' + argIndex, currentMainCreator, methodName, context);

          if (jsonAlias && jsonAlias.values) {
            mappedKey = jsonAlias.values.find((alias) => Object.hasOwnProperty.call(obj, alias));
          }
        }

        if (mappedKey && Object.hasOwnProperty.call(obj, mappedKey)) {
          args.push(this.parseJsonClassType(context, obj, mappedKey, methodName, argIndex));
          argNamesAliasToBeExcluded.push(mappedKey);
        } else if (mappedKey && jsonProperty.required) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Required property "${mappedKey}" not found on parameter at index ${argIndex} of ${currentMainCreator.name}.${methodName} at [Source '${JSON.stringify(obj)}']`);
        } else if (Object.hasOwnProperty.call(obj, key)) {
          args.push(this.parseJsonClassType(context, obj, key, methodName, argIndex));
        } else {
          if (isJsonCreator && context.features.deserialization.FAIL_ON_MISSING_CREATOR_PROPERTIES &&
            (!jsonInject || (jsonInject && !(jsonInject.value in context.injectableValues)))) {
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

    if (isJsonCreator && context.features.deserialization.FAIL_ON_NULL_CREATOR_PROPERTIES) {
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
      if (metadataKey.includes(':JsonVirtualProperty:') || metadataKey.includes(':JsonAlias:')) {

        const realKey = metadataKey.split(
          metadataKey.includes(':JsonVirtualProperty:') ? ':JsonVirtualProperty:' : ':JsonAlias:')[1];
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
      hasMetadata('JsonRawValue', context.mainCreator[0], key, context);
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
    if (context.features.deserialization.UNWRAP_ROOT_VALUE) {
      const jsonRootName: JsonRootNameOptions =
        getMetadata('JsonRootName', context.mainCreator[0], null, context);
      const wrapKey = (jsonRootName && jsonRootName.value) ? jsonRootName.value : context.mainCreator[0].constructor.name;
      if (!(wrapKey in replacement) || Object.keys(replacement).length !== 1) {
        // eslint-disable-next-line max-len
        throw new JacksonError(`No JSON Object with single property as root name "${wrapKey}" found to unwrap value at [Source "${JSON.stringify(replacement)}"]`);
      }
      return clone(replacement[wrapKey]);
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
  private parseJsonClassType(context: JsonParserTransformerContext, obj: any, key: string,
                             methodName?: string, argumentIndex?: number): any {
    let jsonClass: JsonClassTypeOptions;
    if (methodName != null && argumentIndex != null) {
      jsonClass =
        getMetadata('JsonClassTypeParam:' + argumentIndex, context.mainCreator[0], methodName, context);
    }
    if (!jsonClass) {
      // if @JsonClass() is not found at parameter level, try to get it from the class properties
      jsonClass = getMetadata('JsonClassType', context.mainCreator[0], key, context);
    }
    this.propagateDecorators(jsonClass, obj, key, context, methodName, argumentIndex);

    const newContext = cloneDeep(context);

    if (jsonClass && jsonClass.type) {
      newContext.mainCreator = jsonClass.type();
      this._addInternalDecoratorsFromJsonClass(newContext.mainCreator, newContext);
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
            const metadataKeysWithContext =
              makeMetadataKeysWithContext(decorator.name, {contextGroups: decorator.options.contextGroups});
            for (const metadataKeyWithContext of metadataKeysWithContext) {
              decoratorsToBeApplied[metadataKeyWithContext] = {
                enabled: true,
                ...decorator.options
              } as JsonDecoratorOptions;
            }
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
      getMetadata('JsonManagedReference', currentMainCreator, key, context);
    let jsonClassManagedReference: JsonClassTypeOptions =
      getMetadata('JsonClassType', currentMainCreator, key, context);

    if (!jsonManagedReference) {
      const propertySetter = mapVirtualPropertyToClassProperty(currentMainCreator, key, context, {checkSetters: true});
      jsonManagedReference =
        getMetadata('JsonManagedReference', currentMainCreator, propertySetter, context);
      jsonClassManagedReference =
        getMetadata('JsonClassTypeParam:0', currentMainCreator, propertySetter, context);

      if (jsonManagedReference && !jsonClassManagedReference) {
        // eslint-disable-next-line max-len
        throw new JacksonError(`Missing mandatory @JsonClass() decorator for the parameter at index 0 of @JsonManagedReference() decorated ${replacement.constructor.name}.${propertySetter}() method at [Source '${JSON.stringify(obj)}']`);
      }
    }

    if (jsonManagedReference && jsonClassManagedReference) {

      const jsonClassConstructors =  jsonClassManagedReference.type();
      const childConstructor = jsonClassConstructors[0];
      if (isClassIterable(childConstructor)) {
        const backReferenceConstructor = (jsonClassConstructors.length === 1) ?
          Object :
          (
            (!isSameConstructorOrExtensionOfNoObject(childConstructor, Map)) ?
              jsonClassManagedReference.type()[1][0] :
              jsonClassManagedReference.type()[1][1]
          );

        const jsonBackReference: JsonBackReferencePrivateOptions =
          getMetadata('JsonBackReference:' + jsonManagedReference.value,
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
          getMetadata('JsonBackReference:' + jsonManagedReference.value,
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
      getMetadata('JsonAnySetter', replacement.constructor, null, context);
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
      getMetadata('JsonDeserialize', context.mainCreator[0], null, context);
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
      getMetadata('JsonDeserialize', currentMainCreator, key, context);
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
      hasMetadata('JsonIgnore', currentMainCreator, key, context);

    if (!hasJsonIgnore) {
      const jsonIgnoreProperties: JsonIgnorePropertiesOptions =
        getMetadata('JsonIgnoreProperties', currentMainCreator, null, context);
      if (jsonIgnoreProperties) {
        const jsonVirtualProperty: JsonPropertyPrivateOptions | JsonGetterPrivateOptions =
          getMetadata('JsonVirtualProperty:' + key, currentMainCreator, null, context);

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
    return hasMetadata('JsonIgnoreType', context.mainCreator[0], null, context);
  }

  /**
   *
   * @param obj
   * @param context
   */
  private parseJsonTypeInfo(obj: any, context: JsonParserTransformerContext): any {
    const currentMainCreator = context.mainCreator[0];
    const jsonTypeInfo: JsonTypeInfoOptions =
      getMetadata('JsonTypeInfo', currentMainCreator, null, context);

    if (jsonTypeInfo) {
      let jsonTypeCtor: ClassType<any>;
      let jsonTypeInfoProperty: string;
      let newObj = clone(obj);

      switch (jsonTypeInfo.include) {
      case JsonTypeInfoAs.PROPERTY:
        jsonTypeInfoProperty = newObj[jsonTypeInfo.property];
        if (jsonTypeInfoProperty == null &&
          context.features.deserialization.FAIL_ON_MISSING_TYPE_ID && context.features.deserialization.FAIL_ON_INVALID_SUBTYPE) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Missing type id when trying to resolve type or subtype of class ${currentMainCreator.name}: missing type id property '${jsonTypeInfo.property}' at [Source '${JSON.stringify(newObj)}']`);
        } else {
          delete newObj[jsonTypeInfo.property];
        }
        break;
      case JsonTypeInfoAs.WRAPPER_OBJECT:
        if (!(newObj instanceof Object) || newObj instanceof Array) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Expected "Object", got "${newObj.constructor.name}": need JSON Object to contain JsonTypeInfoAs.WRAPPER_OBJECT type information for class "${currentMainCreator.name}" at [Source '${JSON.stringify(newObj)}']`);
        }
        jsonTypeInfoProperty = Object.keys(newObj)[0];
        newObj = newObj[jsonTypeInfoProperty];
        break;
      case JsonTypeInfoAs.WRAPPER_ARRAY:
        if (!(newObj instanceof Array)) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Expected "Array", got "${newObj.constructor.name}": need JSON Array to contain JsonTypeInfoAs.WRAPPER_ARRAY type information for class "${currentMainCreator.name}" at [Source '${JSON.stringify(newObj)}']`);
        } else if (newObj.length > 2 || newObj.length === 0) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Expected "Array" of length 1 or 2, got "Array" of length ${newObj.length}: need JSON Array of length 1 or 2 to contain JsonTypeInfoAs.WRAPPER_ARRAY type information for class "${currentMainCreator.name}" at [Source '${JSON.stringify(newObj)}']`);
        } else if (newObj[0] == null || newObj[0].constructor !== String) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Expected "String", got "${newObj[0] ? newObj[0].constructor.name : newObj[0]}": need JSON String that contains type id (for subtype of "${currentMainCreator.name}") at [Source '${JSON.stringify(newObj)}']`);
        }
        jsonTypeInfoProperty = newObj[0];
        newObj = newObj[1];
        break;
      }

      const jsonTypeIdResolver: JsonTypeIdResolverOptions =
        getMetadata('JsonTypeIdResolver', currentMainCreator, null, context);
      if (jsonTypeIdResolver && jsonTypeIdResolver.resolver) {
        jsonTypeCtor = jsonTypeIdResolver.resolver.typeFromId(jsonTypeInfoProperty, context);
      }

      const jsonSubTypes: JsonSubTypesOptions =
        getMetadata('JsonSubTypes', currentMainCreator, null, context);

      if (!jsonTypeCtor && jsonTypeInfoProperty != null) {
        if (jsonSubTypes && jsonSubTypes.types && jsonSubTypes.types.length > 0) {
          for (const subType of jsonSubTypes.types) {
            const subTypeClass = subType.class() as ObjectConstructor;
            if ( (subType.name != null && jsonTypeInfoProperty === subType.name) ||
              jsonTypeInfoProperty === subTypeClass.name) {
              jsonTypeCtor = subTypeClass;
            }
          }
          if (!jsonTypeCtor && context.features.deserialization.FAIL_ON_INVALID_SUBTYPE) {
            const ids = [(currentMainCreator).name];
            ids.push(...jsonSubTypes.types.map((subType) => (subType.name) ? subType.name : subType.class().name));
            // eslint-disable-next-line max-len
            throw new JacksonError(`Could not resolve type id "${jsonTypeInfoProperty}" as a subtype of "${currentMainCreator.name}": known type ids = [${ids.join(', ')}] at [Source '${JSON.stringify(newObj)}']`);
          }
        }
      }

      if (!jsonTypeCtor) {
        switch (jsonTypeInfo.use) {
        case JsonTypeInfoId.NAME:
          if (jsonTypeInfoProperty != null && jsonTypeInfoProperty === currentMainCreator.name) {
            jsonTypeCtor = currentMainCreator;
          }
          break;
        }
      }

      if (!jsonTypeCtor && context.features.deserialization.FAIL_ON_INVALID_SUBTYPE && jsonTypeInfoProperty != null) {
        const ids = [(currentMainCreator).name];
        if (jsonSubTypes && jsonSubTypes.types && jsonSubTypes.types.length > 0) {
          ids.push(...jsonSubTypes.types.map((subType) => (subType.name) ? subType.name : subType.class().name));
        }
        // eslint-disable-next-line max-len
        throw new JacksonError(`Could not resolve type id "${jsonTypeInfoProperty}" as a subtype of "${currentMainCreator.name}": known type ids = [${ids.join(', ')}] at [Source '${JSON.stringify(newObj)}']`);
      } else if (!jsonTypeCtor) {
        jsonTypeCtor = currentMainCreator;
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
        getMetadata('JsonView', currentMainCreator, key, context);
      if (!jsonView) {
        jsonView = getMetadata('JsonView', currentMainCreator, null, context);
      }

      if (jsonView && jsonView.value) {
        return this.parseIsIncludedByJsonView(jsonView, context);
      }

      return context.features.deserialization.DEFAULT_VIEW_INCLUSION;
    }
    return true;
  }

  /**
   *
   * @param context
   * @param methodName
   * @param argumentIndex
   */
  private parseIsIncludedByJsonViewParam(context: JsonParserTransformerContext, methodName: string, argumentIndex: number): boolean {
    const currentMainCreator = context.mainCreator[0];

    if (context.withViews) {
      const jsonView: JsonViewOptions =
        getMetadata('JsonViewParam:' + argumentIndex, currentMainCreator, methodName, context);

      if (jsonView && jsonView.value) {
        return this.parseIsIncludedByJsonView(jsonView, context);
      }

      return context.features.deserialization.DEFAULT_VIEW_INCLUSION;
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
      if (metadataKey.includes(':JsonUnwrapped:')) {
        const realKey = metadataKey.split(':JsonUnwrapped:')[1];

        const jsonUnwrapped: JsonUnwrappedPrivateOptions =
          getMetadata(metadataKey, currentMainCreator, null, context);
        if (jsonUnwrapped.descriptor != null &&
          typeof jsonUnwrapped.descriptor.value === 'function' &&
          !realKey.startsWith('set')) {
          continue;
        }

        const jsonClass: JsonClassTypeOptions =
          getMetadata('JsonClassType', currentMainCreator, realKey, context);
        if (!jsonClass) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`@JsonUnwrapped() requires use of @JsonClass() for deserialization at ${currentMainCreator.name}["${realKey}"])`);
        }

        const prefix = (jsonUnwrapped.prefix != null) ? jsonUnwrapped.prefix : '';
        const suffix = (jsonUnwrapped.suffix != null) ? jsonUnwrapped.suffix : '';

        replacement[realKey] = {};

        const properties = getClassProperties(jsonClass.type()[0], null, context, {
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
      getMetadata('JsonIdentityInfo', context.mainCreator[0], null, context);

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
      getMetadata('JsonDeserialize',
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
  private parseMapAndObjLiteral(key: string, obj: any, context: JsonParserTransformerContext): Map<any, any> | Record<any, any> {
    const currentCreators = context.mainCreator;
    const currentCreator = currentCreators[0];

    const jsonDeserialize: JsonDeserializeOptions =
      getMetadata('JsonDeserialize', context._propertyParentCreator, key, context);

    let map: Map<any, any> | Record<any, any>;

    const newContext = cloneDeep(context);
    if (currentCreators.length > 1 && currentCreators[1] instanceof Array) {
      newContext.mainCreator = currentCreators[1] as [ClassType<any>];
    } else {
      newContext.mainCreator = [Object];
    }

    if (isSameConstructorOrExtensionOfNoObject(currentCreator, Map)) {
      map = new (currentCreator as ObjectConstructor)() as Map<any, any>;
    } else {
      map = {};
    }

    const mapCurrentCreators = newContext.mainCreator;

    const mapKeys = Object.keys(obj);
    for (let mapKey of mapKeys) {
      let mapValue = obj[mapKey];

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

      if (jsonDeserialize && (jsonDeserialize.contentUsing || jsonDeserialize.keyUsing)) {
        mapKey = (jsonDeserialize.keyUsing) ? jsonDeserialize.keyUsing(mapKey, keyNewContext) : mapKey;
        mapValue = (jsonDeserialize.contentUsing) ?
          jsonDeserialize.contentUsing(mapValue, valueNewContext) : mapValue;

        if (mapKey != null && mapKey.constructor !== Object) {
          keyNewContext.mainCreator[0] = mapKey.constructor;
        }
        if (mapValue != null && mapValue.constructor !== Object) {
          valueNewContext.mainCreator[0] = mapValue.constructor;
        }
      }

      const mapKeyParsed = this.deepTransform('', mapKey, keyNewContext);
      const mapValueParsed = this.deepTransform(mapKey, mapValue, valueNewContext);
      if (map instanceof Map) {
        map.set(mapKeyParsed, mapValueParsed);
      } else {
        map[mapKeyParsed] = mapValueParsed;
      }
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
      getMetadata('JsonNaming', context.mainCreator[0], null, context);
    if (jsonNamingOptions && jsonNamingOptions.strategy != null) {
      const keys = Object.keys(obj);
      const classProperties = new Set<string>(getClassProperties(context.mainCreator[0], null, context, {
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
          oldKey = mapVirtualPropertyToClassProperty(context.mainCreator[0], oldKey, context, {checkSetters: true});
          obj[oldKey] = obj[key];
          delete obj[key];
        }
      }
    }
  }
}
