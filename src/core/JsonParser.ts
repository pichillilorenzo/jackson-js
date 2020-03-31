import {
  getArgumentNames, getClassProperties, getDefaultPrimitiveTypeValue, getMetadata, hasMetadata, isClassIterable,
  isClassIterableNoMapNoString, isConstructorPrimitiveType, isFloat,
  isIterableNoMapNoString,
  isSameConstructor, isSameConstructorOrExtensionOf,
  isSameConstructorOrExtensionOfNoObject
} from '../util';
import {
  ClassList,
  ClassType,
  JsonAliasOptions, JsonAppendOptions,
  JsonClassOptions, JsonDeserializeOptions,
  JsonIdentityInfoOptions,
  JsonIgnorePropertiesOptions, JsonInjectOptions,
  JsonManagedReferenceOptions, JsonNamingOptions,
  JsonParserOptions, JsonParserTransformerOptions,
  JsonPropertyOptions, JsonRootNameOptions, JsonSetterOptions, JsonStringifierTransformerOptions,
  JsonSubTypeOptions, JsonSubTypesOptions,
  JsonTypeInfoOptions, JsonTypeNameOptions,
  JsonUnwrappedOptions,
  JsonViewOptions
} from '../@types';
import {JsonPropertyAccess} from '../annotations/JsonProperty';
import {JsonTypeInfoAs, JsonTypeInfoId} from '../annotations/JsonTypeInfo';
import {DeserializationFeature} from '../databind/DeserializationFeature';
import {JacksonError} from './JacksonError';
import {
  JsonAnySetterPrivateOptions,
  JsonBackReferencePrivateOptions,
  JsonCreatorPrivateOptions, JsonSetterPrivateOptions, JsonTypeNamePrivateOptions
} from '../@types/private';
import {JsonNamingStrategy} from '../annotations/JsonNaming';
import {defaultCreatorName} from '../annotations/JsonCreator';

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
   * @param options
   */
  parse(text: string, options: JsonParserOptions = {}): T {
    const value = JSON.parse(text);

    const newOptions: JsonParserTransformerOptions = this.convertParserOptionsToTransformerOptions(options);
    newOptions.mainCreator = newOptions.mainCreator ? newOptions.mainCreator : [(value != null) ? value.constructor : Object];
    const result = this.transform('', value, newOptions);

    if (this._globalUnresolvedValueAlreadySeen.size > 0 &&
      newOptions.features[DeserializationFeature.FAIL_ON_UNRESOLVED_OBJECT_IDS]) {
      throw new JacksonError(`Found unresolved Object Ids: ${[...this._globalUnresolvedValueAlreadySeen].join(', ')}`);
    }

    return result;
  }

  /**
   *
   * @param key
   * @param value
   * @param options
   */
  transform(key: string, value: any, options: JsonParserTransformerOptions): any {

    options = {
      features: [],
      deserializers: [],
      injectableValues: {},
      ...options
    };

    if (options.forType && options.forType.has(options.mainCreator[0])) {
      options = {
        mainCreator: options.mainCreator,
        ...options,
        ...options.forType.get(options.mainCreator[0])
      };
    }

    value = this.invokeCustomDeserializers(key, value, options);
    value = this.parseJsonDeserializeClass(options, value);

    if (value == null && isConstructorPrimitiveType(options.mainCreator[0])) {
      value = this.getDefaultValue(options);
    }

    if ( (value instanceof Array && value.length === 0 && options.features[DeserializationFeature.ACCEPT_EMPTY_ARRAY_AS_NULL_OBJECT]) ||
      (value != null && value.constructor === String && value.length === 0 &&
        options.features[DeserializationFeature.ACCEPT_EMPTY_STRING_AS_NULL_OBJECT]) ) {
      value = null;
    }

    const currentConstructor = options.mainCreator[0];
    if (value == null && options.features[DeserializationFeature.FAIL_ON_NULL_FOR_PRIMITIVES] &&
      isConstructorPrimitiveType(currentConstructor)) {
      throw new JacksonError(`Cannot map "null" into primitive type ${(currentConstructor as ObjectConstructor).name}`);
    }

    if (value != null && value.constructor === Number && options.features[DeserializationFeature.ACCEPT_FLOAT_AS_INT] && isFloat(value)) {
      value = parseInt(value + '', 10);
    }

    if (value != null) {

      let instance = this.getInstanceAlreadySeen(key, value, options);
      if (instance != null) {
        return instance;
      }

      value = this.parseJsonTypeInfo(value, options);

      if (isSameConstructorOrExtensionOfNoObject(currentConstructor, Map)) {
        return this.parseMap(value, options);
      } else if (BigInt && isSameConstructorOrExtensionOfNoObject(currentConstructor, BigInt)) {
        return (value != null && value.constructor === String && value.endsWith('n')) ?
          (currentConstructor as ObjectConstructor)(value.substring(0, value.length - 1)) :
          (currentConstructor as ObjectConstructor)(value);
      } else if (isSameConstructorOrExtensionOfNoObject(currentConstructor, RegExp) ||
        isSameConstructorOrExtensionOfNoObject(currentConstructor, Date)) {
        return new (currentConstructor as ObjectConstructor)(value);
      } else if (typeof value === 'object' && !isIterableNoMapNoString(value)) {

        if (this.parseJsonIgnoreType(options)) {
          return null;
        }

        this.parseJsonNaming(value, options);

        let replacement = value;
        replacement = this.parseJsonRootName(replacement, options);

        this.parseJsonUnwrapped(replacement, options);
        this.parseJsonPropertyAndJsonAlias(replacement, options);

        for (const k in replacement) {
          if (Object.hasOwnProperty.call(replacement, k)) {
            if (this.parseHasJsonIgnore(options, k) || !this.parseHasJsonView(options, k)) {
              delete replacement[k];
            } else {
              this.parseJsonRawValue(options, replacement, k);
              this.parseJsonDeserializeProperty(options, replacement,  k);
            }
          }
        }

        instance = this.parseJsonCreator(options, replacement);
        if (instance) {
          replacement = instance;
        }

        return replacement;
      } else if (isIterableNoMapNoString(value)) {
        const replacement = this.parseIterable(value, key, options);
        return replacement;
      }
    }

    return value;
  }

  private convertParserOptionsToTransformerOptions(options: JsonParserOptions): JsonParserTransformerOptions {
    const newOptions: JsonParserTransformerOptions = {
      mainCreator: options.mainCreator ? options.mainCreator() : [Object]
    };
    for (const key in options) {
      if (key !== 'mainCreator') {
        newOptions[key] = options[key];
      }
    }
    return newOptions;
  }

  private getDefaultValue(options: JsonParserTransformerOptions): any | null {
    let defaultValue = null;
    const currentMainCreator = options.mainCreator[0];
    if (currentMainCreator === String &&
      (options.features[DeserializationFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        options.features[DeserializationFeature.SET_DEFAULT_VALUE_FOR_STRING_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(String);
    } else if (currentMainCreator === Number &&
      (options.features[DeserializationFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        options.features[DeserializationFeature.SET_DEFAULT_VALUE_FOR_NUMBER_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(Number);
    } else if (currentMainCreator === Boolean &&
      (options.features[DeserializationFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        options.features[DeserializationFeature.SET_DEFAULT_VALUE_FOR_BOOLEAN_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(Boolean);
    } else if (BigInt && currentMainCreator === BigInt &&
      (options.features[DeserializationFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        options.features[DeserializationFeature.SET_DEFAULT_VALUE_FOR_BIGINT_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(BigInt);
    } else if (Symbol && currentMainCreator === Symbol &&
      (options.features[DeserializationFeature.SET_DEFAULT_VALUE_FOR_PRIMITIVES_ON_NULL] ||
        options.features[DeserializationFeature.SET_DEFAULT_VALUE_FOR_SYMBOL_ON_NULL]) ) {
      defaultValue = getDefaultPrimitiveTypeValue(Symbol);
    }
    return defaultValue;
  }

  private invokeCustomDeserializers(key: string, value: any, options: JsonParserTransformerOptions): any {
    if (options.deserializers) {
      const currentMainCreator = options.mainCreator[0];
      for (const deserializer of options.deserializers) {
        if (deserializer.type != null) {
          const classType = deserializer.type();
          if (
            (value != null && typeof classType === 'string' && classType !== typeof value) ||
            (typeof classType !== 'string' && currentMainCreator != null && !isSameConstructor(classType, currentMainCreator))
          ) {
            continue;
          }
        }
        value = deserializer.mapper(key, value);
      }
    }
    return value;
  }

  private getInstanceAlreadySeen(key: string, value: any, options: JsonParserTransformerOptions): null | any {
    const currentMainCreator = options.mainCreator[0];
    const jsonIdentityInfo: JsonIdentityInfoOptions =
      getMetadata('jackson:JsonIdentityInfo', currentMainCreator, null, options.annotationsEnabled);

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

  private parseJsonCreator(options: JsonParserTransformerOptions, obj: any): any {
    if (obj) {

      const currentMainCreator = options.mainCreator[0];
      const withCreatorName = options.withCreatorName;

      const jsonCreatorMetadataKey = 'jackson:JsonCreator:' + ((withCreatorName != null) ? withCreatorName : defaultCreatorName);

      const hasJsonCreator =
        hasMetadata(jsonCreatorMetadataKey, currentMainCreator, null, options.annotationsEnabled);

      const jsonCreator: JsonCreatorPrivateOptions | ClassType<any> = (hasJsonCreator) ?
        getMetadata(jsonCreatorMetadataKey, currentMainCreator, null, options.annotationsEnabled) :
        currentMainCreator;

      const jsonIgnoreProperties: JsonIgnorePropertiesOptions =
        getMetadata('jackson:JsonIgnoreProperties', currentMainCreator, null, options.annotationsEnabled);

      const method = (hasJsonCreator) ?
        (((jsonCreator as JsonCreatorPrivateOptions).ctor) ?
          (jsonCreator as JsonCreatorPrivateOptions).ctor :
          (jsonCreator as JsonCreatorPrivateOptions).method)
        : jsonCreator;

      const args = [];
      const argNames = getArgumentNames(method);

      let argIndex = 0;
      const argNamesAliasToBeExcluded = [];

      for (const key of argNames) {
        const jsonInject: JsonInjectOptions =
          getMetadata('jackson:JsonInjectParam:' + argIndex, currentMainCreator,
            ('propertyKey' in jsonCreator && jsonCreator.propertyKey) ? jsonCreator.propertyKey : 'constructor',
            options.annotationsEnabled);

        if (!jsonInject || (jsonInject && jsonInject.useInput)) {
          const jsonProperty: JsonPropertyOptions = getMetadata('jackson:JsonPropertyParam:' + argIndex, currentMainCreator,
            ('propertyKey' in jsonCreator && jsonCreator.propertyKey) ? jsonCreator.propertyKey : 'constructor',
            options.annotationsEnabled);

          let mappedKey: string = jsonProperty != null ? jsonProperty.value : null;
          if (!mappedKey) {
            const jsonAlias: JsonAliasOptions =
              getMetadata('jackson:JsonAliasParam:' + argIndex, currentMainCreator,
                ('propertyKey' in jsonCreator && jsonCreator.propertyKey) ? jsonCreator.propertyKey : 'constructor',
                options.annotationsEnabled);

            if (jsonAlias && jsonAlias.values) {
              mappedKey = jsonAlias.values.find((alias) => Object.hasOwnProperty.call(obj, alias));
            }
          }

          if (mappedKey && Object.hasOwnProperty.call(obj, mappedKey)) {
            args.push(this.parseJsonClass(options, obj, mappedKey));
            argNamesAliasToBeExcluded.push(mappedKey);
          } else if (mappedKey && jsonProperty.required) {
            // eslint-disable-next-line max-len
            throw new JacksonError(`Required property "${mappedKey}" not found on @JsonCreator() of "${currentMainCreator.name}" at [Source '${JSON.stringify(obj)}']`);
          } else if (Object.hasOwnProperty.call(obj, key)) {
            args.push(this.parseJsonClass(options, obj, key));
          } else {
            if (options.features[DeserializationFeature.FAIL_ON_MISSING_CREATOR_PROPERTIES]) {
              // eslint-disable-next-line max-len
              throw new JacksonError(`Missing @JsonCreator() parameter at index ${argIndex} for Class "${currentMainCreator.name}" at [Source '${JSON.stringify(obj)}']`);
            }
            args.push(jsonInject ? options.injectableValues[jsonInject.value] : null);
          }

        } else {
          // force argument value to use options.injectableValues
          args.push(jsonInject ? options.injectableValues[jsonInject.value] : null);
        }

        argIndex++;
      }

      if (options.features[DeserializationFeature.FAIL_ON_NULL_CREATOR_PROPERTIES]) {
        const argsLength = args.length;
        for (let i = 0; i < argsLength; i++) {
          const arg = args[i];
          if (arg == null) {
            // eslint-disable-next-line max-len
            throw new JacksonError(`Found "${arg}" value on @JsonCreator() parameter at index ${i} for Class "${currentMainCreator.name}" at [Source '${JSON.stringify(obj)}']`);
          }
        }
      }

      const instance = ('method' in jsonCreator && jsonCreator.method) ?
        (method as Function)(...args) : new (method as ObjectConstructor)(...args);

      const hasJsonAnySetter =
        hasMetadata('jackson:JsonAnySetter', instance, null, options.annotationsEnabled);

      this.parseJsonIdentityInfo(instance, obj, options);

      const jsonAppendAttributesToBeExcluded = [];
      const jsonAppend: JsonAppendOptions =
        getMetadata('jackson:JsonAppend', instance.constructor, null, options.annotationsEnabled);
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

      const keysToBeExcluded = [...new Set([...argNames, ...argNamesAliasToBeExcluded, ...jsonAppendAttributesToBeExcluded])];
      // copy remaining properties and ignore the ones that are not part of "instance", except for instances of Object class
      const keys = Object.keys(obj).filter(n => !keysToBeExcluded.includes(n));

      for (const key of keys) {
        const jsonSetter: JsonSetterPrivateOptions = getMetadata('jackson:JsonSetter', instance, key, options.annotationsEnabled);
        if (jsonSetter &&
          !(jsonIgnoreProperties && !jsonIgnoreProperties.allowSetters && jsonIgnoreProperties.value.includes(key))) {
          instance[key] = instance[jsonSetter.propertyKey](obj[key]);
        } else if (Object.hasOwnProperty.call(instance, key) || instance.constructor.name === 'Object') {
          // on TypeScript, set "useDefineForClassFields" option to true on the tsconfig.json file
          instance[key] = this.parseJsonClass(options, obj, key);
        } else if (hasJsonAnySetter) {
          // for any other unrecognized properties found
          this.parseJsonAnySetter(instance, obj, key, options);
        } else if ((jsonIgnoreProperties == null && options.features[DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES]) ||
            (jsonIgnoreProperties != null && !jsonIgnoreProperties.ignoreUnknown)) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Unknown property "${key}" for ${instance.constructor.name} at [Source '${JSON.stringify(obj)}']`);
        }
      }

      for (const key in instance) {
        if (Object.hasOwnProperty.call(instance, key)) {
          const jsonInject: JsonInjectOptions =
            getMetadata('jackson:JsonInject', instance, key, options.annotationsEnabled);
          if (jsonInject) {
            instance[key] = (!jsonInject.useInput || (jsonInject.useInput && instance[key] == null)) ?
              options.injectableValues[jsonInject.value] : instance[key];
            continue;
          }
          // if there is a reference, convert the reference property to the corresponding Class
          this.parseJsonManagedReference(instance, options, obj, key);
        }
      }

      return instance;
    }
  }

  private parseJsonPropertyAndJsonAlias(replacement: any, options: JsonParserTransformerOptions): void {
    const currentMainCreator = options.mainCreator[0];
    // convert JsonProperty to Class properties
    const creatorMetadataKeys = Reflect.getMetadataKeys(currentMainCreator);

    for (const metadataKey of creatorMetadataKeys) {
      if (metadataKey.startsWith('jackson:JsonProperty:') || metadataKey.startsWith('jackson:JsonAlias:')) {

        const realKey = metadataKey.replace(
          metadataKey.startsWith('jackson:JsonProperty:') ? 'jackson:JsonProperty:' : 'jackson:JsonAlias:', '');
        const jsonProperty: JsonPropertyOptions =
          getMetadata(metadataKey, currentMainCreator, null, options.annotationsEnabled);
        const jsonAlias: JsonAliasOptions =
          getMetadata(metadataKey, currentMainCreator, null, options.annotationsEnabled);

        const isIgnored = jsonProperty && jsonProperty.access === JsonPropertyAccess.READ_ONLY;

        if (jsonProperty && !isIgnored && Object.hasOwnProperty.call(replacement, jsonProperty.value)) {
          replacement[realKey] = replacement[jsonProperty.value];
          if (realKey !== jsonProperty.value) {
            delete replacement[jsonProperty.value];
          }
        } else if (jsonProperty && jsonProperty.required) {
          throw new JacksonError(`Required property "${jsonProperty.value}" not found at [Source '${JSON.stringify(replacement)}']`);
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
        } else if (isIgnored) {
          delete replacement[realKey];
        }
      }
    }
  }

  private parseJsonRawValue(options: JsonParserTransformerOptions, replacement: any, key: string): void {
    const jsonRawValue =
      hasMetadata('jackson:JsonRawValue', options.mainCreator[0], key, options.annotationsEnabled);
    if (jsonRawValue) {
      replacement[key] = JSON.stringify(replacement[key]);
    }
  }

  private parseJsonRootName(replacement: any, options: JsonParserTransformerOptions): any {
    const jsonRootName: JsonRootNameOptions =
      getMetadata('jackson:JsonRootName', options.mainCreator[0], null, options.annotationsEnabled);
    if (jsonRootName && jsonRootName.value) {
      return replacement[jsonRootName.value];
    }
    return replacement;
  }

  private parseJsonClass(options: JsonParserTransformerOptions, obj: any, key: string): any {
    const jsonClass: JsonClassOptions =
      getMetadata('jackson:JsonClass', options.mainCreator[0], key, options.annotationsEnabled);
    const newOptions = {...options};

    if (jsonClass && jsonClass.class) {
      newOptions.mainCreator = jsonClass.class();
      const newCreator = newOptions.mainCreator[0];

      if (isClassIterableNoMapNoString(newCreator)) {
        return this.parseIterable(obj[key], key, newOptions);
      }
    } else {
      const newCreator = (obj[key] != null) ? obj[key].constructor : Object;
      newOptions.mainCreator = [newCreator];
    }
    return this.transform(key, obj[key], newOptions);
  }

  private parseJsonManagedReference(replacement: any, options: JsonParserTransformerOptions, obj: any, key: string): void {
    const jsonManagedReference: JsonManagedReferenceOptions =
      getMetadata('jackson:JsonManagedReference', replacement.constructor, key, options.annotationsEnabled);
    const jsonClassManagedReference: JsonClassOptions =
      getMetadata('jackson:JsonClass', replacement.constructor, key, options.annotationsEnabled);

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
            backReferenceConstructor, null, options.annotationsEnabled);

        if (jsonBackReference) {
          if (isSameConstructorOrExtensionOfNoObject(childConstructor, Map)) {
            for (const [k, value] of replacement[key]) {
              value[jsonBackReference.propertyKey] = replacement;
            }
          } else {
            for (const value of replacement[key]) {
              value[jsonBackReference.propertyKey] = replacement;
            }
          }
        }
      } else {
        const jsonBackReference: JsonBackReferencePrivateOptions =
          getMetadata('jackson:JsonBackReference:' + jsonManagedReference.value,
            childConstructor, null, options.annotationsEnabled);
        if (jsonBackReference) {
          replacement[key][jsonBackReference.propertyKey] = replacement;
        }
      }
    } else if (jsonManagedReference && !jsonClassManagedReference) {
      // eslint-disable-next-line max-len
      throw new JacksonError(`Missing mandatory @JsonClass() annotation for the @JsonManagedReference() annotated ${replacement.constructor.name}["${key}"] field at [Source '${JSON.stringify(obj)}']`);
    }
  }

  private parseJsonAnySetter(replacement: any, obj: any, key: string, options: JsonParserTransformerOptions): void {
    const jsonAnySetter: JsonAnySetterPrivateOptions =
      getMetadata('jackson:JsonAnySetter', replacement, null, options.annotationsEnabled);
    if (jsonAnySetter && replacement[jsonAnySetter.propertyKey]) {
      if (typeof replacement[jsonAnySetter.propertyKey] === 'function') {
        replacement[jsonAnySetter.propertyKey](key, obj[key]);
      } else {
        replacement[jsonAnySetter.propertyKey][key] = obj[key];
      }
    }
  }

  private parseJsonDeserializeClass(options: JsonParserTransformerOptions, replacement: any): any {
    const jsonDeserialize: JsonDeserializeOptions =
      getMetadata('jackson:JsonDeserialize', options.mainCreator[0], null, options.annotationsEnabled);
    if (jsonDeserialize && jsonDeserialize.using) {
      return jsonDeserialize.using(replacement);
    }
    return replacement;
  }

  private parseJsonDeserializeProperty(options: JsonParserTransformerOptions, replacement: any, key: string): void {
    const jsonDeserialize: JsonDeserializeOptions =
      getMetadata('jackson:JsonDeserialize', options.mainCreator[0], key, options.annotationsEnabled);
    if (jsonDeserialize && jsonDeserialize.using) {
      replacement[key] = jsonDeserialize.using(replacement[key]);
    }
  }

  private parseHasJsonIgnore(options: JsonParserTransformerOptions, key: string): boolean {
    const currentMainCreator = options.mainCreator[0];
    const hasJsonIgnore =
      hasMetadata('jackson:JsonIgnore', currentMainCreator, key, options.annotationsEnabled);

    if (!hasJsonIgnore) {
      const jsonIgnoreProperties: JsonIgnorePropertiesOptions =
        getMetadata('jackson:JsonIgnoreProperties', currentMainCreator, null, options.annotationsEnabled);
      if (jsonIgnoreProperties) {
        if (jsonIgnoreProperties.value.includes(key)) {
          const hasJsonSetter = hasMetadata('jackson:JsonSetter', currentMainCreator, key, options.annotationsEnabled);
          if (jsonIgnoreProperties.allowSetters && hasJsonSetter) {
            return false;
          }
          return true;
        }
        const jsonProperty: JsonPropertyOptions =
          getMetadata('jackson:JsonProperty:' + key, currentMainCreator, null, options.annotationsEnabled);
        if (jsonProperty && jsonIgnoreProperties.value.includes(jsonProperty.value)) {
          return true;
        }
      }
    }
    return hasJsonIgnore;
  }

  private parseJsonIgnoreType(options: JsonParserTransformerOptions): boolean {
    return hasMetadata('jackson:JsonIgnoreType', options.mainCreator[0], null, options.annotationsEnabled);
  }

  private parseJsonTypeInfo(obj: any, options: JsonParserTransformerOptions): any {
    const currentMainCreator = options.mainCreator[0];
    const jsonTypeInfo: JsonTypeInfoOptions =
      getMetadata('jackson:JsonTypeInfo', currentMainCreator, null, options.annotationsEnabled);

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

      const jsonSubTypes: JsonSubTypesOptions =
        getMetadata('jackson:JsonSubTypes', currentMainCreator, null, options.annotationsEnabled);

      if (jsonSubTypes && jsonSubTypes.types) {
        for (const subType of jsonSubTypes.types) {
          if (subType.name != null && jsonTypeInfoProperty === subType.name) {
            jsonTypeCtor = subType.class();
          } else {
            const jsonTypeNameOptions: JsonTypeNamePrivateOptions =
              getMetadata('jackson:JsonTypeName:' + jsonTypeInfoProperty, subType.class(), null, options.annotationsEnabled);
            if (jsonTypeNameOptions && jsonTypeNameOptions.ctor) {
              jsonTypeCtor = jsonTypeNameOptions.ctor as ClassType<any>;
            }
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

      switch (jsonTypeInfo.include) {
      case JsonTypeInfoAs.WRAPPER_OBJECT:
        if (!isSameConstructor(jsonTypeInfoProperty, jsonTypeCtor)) {
          const ids = [(currentMainCreator).name];
          if (jsonSubTypes && jsonSubTypes.types) {
            ids.push(...jsonSubTypes.types.map((subType) => subType.class().name));
          }
          // eslint-disable-next-line max-len
          throw new JacksonError(`Could not resolve type id "${jsonTypeInfoProperty}" as a subtype of "${currentMainCreator.name}": known type ids = [${ids.join(', ')}] at [Source '${JSON.stringify(obj)}']`);
        }
        break;
      }

      options.mainCreator = [jsonTypeCtor];
      return newObj;
    }

    return obj;
  }

  private parseHasJsonView(options: JsonParserTransformerOptions, key: string): boolean {
    if (options.withViews) {
      const jsonView: JsonViewOptions =
        getMetadata('jackson:JsonView', options.mainCreator[0], key, options.annotationsEnabled);
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

  private parseJsonUnwrapped(replacement: any, options: JsonParserTransformerOptions): void {
    const currentMainCreator = options.mainCreator[0];
    const metadataKeys: string[] = Reflect.getMetadataKeys(currentMainCreator);
    for (const metadataKey of metadataKeys) {
      if (metadataKey.startsWith('jackson:JsonUnwrapped:')) {
        const realKey = metadataKey.replace('jackson:JsonUnwrapped:', '');
        const jsonUnwrapped: JsonUnwrappedOptions =
          getMetadata(metadataKey, currentMainCreator, null, options.annotationsEnabled);

        const prefix = (jsonUnwrapped.prefix != null) ? jsonUnwrapped.prefix : '';
        const suffix = (jsonUnwrapped.suffix != null) ? jsonUnwrapped.suffix : '';

        replacement[realKey] = {};

        for (const k in replacement) {
          if (k.startsWith(prefix) && k.endsWith(suffix) && Object.hasOwnProperty.call(replacement, k)) {
            const unwrappedKey = k.substr(prefix.length, k.length - suffix.length);
            replacement[realKey][unwrappedKey] = replacement[k];
            delete replacement[k];
          }
        }
      }
    }
  }

  private parseJsonIdentityInfo(replacement: any, obj: any, options: JsonParserTransformerOptions): void {
    const jsonIdentityInfo: JsonIdentityInfoOptions =
      getMetadata('jackson:JsonIdentityInfo', options.mainCreator[0], null, options.annotationsEnabled);

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

  private parseIterable(iterable: any, key: string, options: JsonParserTransformerOptions): any {

    const currentCreators = options.mainCreator;
    const currentCreator = currentCreators[0];

    let newIterable: any;
    const newOptions = {...options};

    if (currentCreators.length > 1 && currentCreators[1] instanceof Array) {
      newOptions.mainCreator = currentCreators[1] as [ClassType<any>];
    } else {
      newOptions.mainCreator = [Object];
    }

    if (isSameConstructorOrExtensionOfNoObject(currentCreator, Set)) {
      if (isSameConstructor(currentCreator, Set)) {
        newIterable = new Set();
      } else {
        newIterable = new (currentCreator as ObjectConstructor)() as Set<any>;
      }
      for (const value of iterable) {
        if (newOptions.mainCreator == null) {
          newOptions.mainCreator = [(value != null) ? value.constructor : Object];
        }
        (newIterable as Set<any>).add(this.transform(key, value, newOptions));
      }
    } else {
      newIterable = [];
      for (const value of iterable) {
        if (newOptions.mainCreator == null) {
          newOptions.mainCreator = [(value != null) ? value.constructor : Object];
        }
        (newIterable as Array<any>).push(this.transform(key, value, newOptions));
      }
      if (!isSameConstructor(currentCreator, Array)) {
        // @ts-ignore
        newIterable = new currentCreator(...newIterable);
      }
    }

    return newIterable;
  }

  private parseMap(obj: any, options: JsonParserTransformerOptions): Map<any, any> {
    const currentCreators = options.mainCreator;
    const currentCreator = currentCreators[0];

    let map: Map<any, any>;

    const newOptions = {...options};

    if (currentCreators.length > 1 && currentCreators[1] instanceof Array) {
      newOptions.mainCreator = currentCreators[1] as [ClassType<any>];
    } else {
      newOptions.mainCreator = [Object];
    }

    if (isSameConstructor(currentCreator, Map)) {
      map = new Map();
    } else {
      map = new (currentCreator as ObjectConstructor)() as Map<any, any>;
    }

    const keyNewOptions = {...newOptions};
    const valueNewOptions = {...newOptions};

    const mapCurrentCreators = newOptions.mainCreator;
    keyNewOptions.mainCreator = [mapCurrentCreators[0]];
    if (mapCurrentCreators.length > 1) {
      if (mapCurrentCreators[1] instanceof Array) {
        valueNewOptions.mainCreator = mapCurrentCreators[1] as [ClassType<any>];
      } else {
        valueNewOptions.mainCreator = [mapCurrentCreators[1]] as [ClassType<any>];
      }
    } else {
      valueNewOptions.mainCreator = [Object];
    }

    // eslint-disable-next-line guard-for-in
    for (const key in obj) {
      map.set(key, this.transform(key, obj[key], valueNewOptions));
    }

    return map;
  }

  private generateScopedId(scope: string, id: string): string {
    return scope + ': ' + id;
  }

  private parseJsonNaming(obj: any, options: JsonParserTransformerOptions): void {
    const jsonNamingOptions: JsonNamingOptions =
      getMetadata('jackson:JsonNaming', options.mainCreator[0], null, options.annotationsEnabled);
    if (jsonNamingOptions && jsonNamingOptions.strategy != null) {
      const keys = Object.keys(obj);
      const classProperties = new Set<string>(getClassProperties(options.mainCreator[0]));
      const keysLength = keys.length;
      for (let i = 0; i < keysLength; i++) {
        const key = keys[i];
        let oldKey = key;
        switch (jsonNamingOptions.strategy) {
        case JsonNamingStrategy.KEBAB_CASE:
          oldKey = key.replace(/-/g, '');
          break;
        case JsonNamingStrategy.LOWER_DOT_CASE:
          oldKey = key.replace(/\./g, '');
          break;
        case JsonNamingStrategy.LOWER_CAMEL_CASE:
        case JsonNamingStrategy.LOWER_CASE:
        case JsonNamingStrategy.UPPER_CAMEL_CASE:
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
        if (!propertyFound && jsonNamingOptions.strategy === JsonNamingStrategy.SNAKE_CASE) {
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
          obj[oldKey] = obj[key];
          delete obj[key];
        }
      }
    }
  }
}
