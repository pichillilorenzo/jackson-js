import {JsonCreatorPrivateOptions} from '../annotations/JsonCreator';
import {
  getArgumentNames, isClassIterable,
  isClassIterableNoMap,
  isExtensionOf,
  isIterableNoMapNoString,
  isSameConstructor, isSameConstructorOrExtensionOf,
  isSameConstructorOrExtensionOfNoObject
} from '../util';
import {
  ClassType,
  JsonAliasOptions,
  JsonClassOptions,
  JsonIdentityInfoOptions,
  JsonIgnorePropertiesOptions,
  JsonManagedReferenceOptions,
  JsonParserOptions,
  JsonPropertyOptions,
  JsonSubTypeOptions,
  JsonTypeInfoOptions,
  JsonUnwrappedOptions,
  JsonViewOptions
} from '../@types';
import {JsonPropertyAccess} from '../annotations/JsonProperty';
import {JsonTypeInfoAs, JsonTypeInfoId} from '../annotations/JsonTypeInfo';
import {DeserializationFeature} from '../databind/DeserializationFeature';
import {JacksonError} from './JacksonError';
import {JsonAnySetterPrivateOptions} from '../annotations/JsonAnySetter';
import {JsonBackReferencePrivateOptions} from '../annotations/JsonBackReference';

export class JsonParser<T> {

  // Map used to restore object circular references defined with @JsonIdentityInfo()
  private _globalValueAlreadySeen = new Map();

  constructor() {
  }

  parse(text: string, options: JsonParserOptions = {}): T {
    const value = JSON.parse(text);
    return this.deepParse('', value, {mainCreator: () => [value.constructor], ...options});
  }

  invokeCustomDeserializers(key: string, value: any, options: JsonParserOptions): any {
    if (options.deserializers) {
      for (const deserializer of options.deserializers) {
        if (deserializer.type != null) {
          if ( value != null &&
            (
              (typeof deserializer.type === 'string' && deserializer.type !== typeof value) ||
              (typeof deserializer.type !== 'string' && value.constructor != null &&
                !isSameConstructor(deserializer.type, value.constructor))
            )
          ) {
            continue;
          }
        }
        value = deserializer.mapper(key, value);
      }
    }
    return value;
  }

  parseJsonCreator(options: JsonParserOptions, obj: any): any {
    if (obj) {

      const currentMainCreator = options.mainCreator()[0];

      const hasJsonCreator = Reflect.hasMetadata('jackson:JsonCreator', currentMainCreator);

      const jsonCreator: JsonCreatorPrivateOptions = (hasJsonCreator) ?
        Reflect.getMetadata('jackson:JsonCreator', currentMainCreator) :
        currentMainCreator;

      const jsonIgnorePropertiesOptions: JsonIgnorePropertiesOptions =
        Reflect.getMetadata('jackson:JsonIgnoreProperties', currentMainCreator);

      const method = (hasJsonCreator) ? ((jsonCreator.constructor) ? jsonCreator.constructor : jsonCreator.method) : jsonCreator;

      const args = [];
      const argNames = getArgumentNames(method, !!jsonCreator.constructor);

      let argIndex = 0;
      for (const key of argNames) {
        const jsonProperty: JsonPropertyOptions = Reflect.getMetadata('jackson:JsonPropertyParam:' + argIndex, currentMainCreator);
        const mappedKey = jsonProperty != null ? jsonProperty.value : null;
        if (mappedKey && Object.hasOwnProperty.call(obj, mappedKey)) {
          args.push(this.parseJsonClass(options, obj, mappedKey));
        } else if (mappedKey && jsonProperty.required) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Required property ${mappedKey} not found on @JsonCreator() of ${currentMainCreator.name} at [Source '${JSON.stringify(obj)}']`);
        } else if (Object.hasOwnProperty.call(obj, key)) {
          args.push(this.parseJsonClass(options, obj, key));
        } else {
          args.push(null);
        }
        argIndex++;
      }

      const instance = (jsonCreator.constructor) ? new (method as ObjectConstructor)(...args) : (method as Function)(...args);

      const hasJsonAnySetter = Reflect.hasMetadata('jackson:JsonAnySetter', instance);

      this.parseJsonIdentityInfo(instance, obj, options);

      // copy remaining properties and ignore the ones that are not part of "instance", except for instances of Object class
      const keys = Object.keys(obj).filter(n => !argNames.includes(n));
      for (const key of keys) {
        if (Object.hasOwnProperty.call(instance, key) || instance.constructor.name === 'Object') {
          // on TypeScript, set "useDefineForClassFields" option to true on the tsconfig.json file
          instance[key] = this.parseJsonClass(options, obj, key);
        } else if (hasJsonAnySetter) {
          this.parseJsonAnySetter(instance, obj, key);
        } else if ((jsonIgnorePropertiesOptions == null && options.features[DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES]) ||
            (jsonIgnorePropertiesOptions != null && !jsonIgnorePropertiesOptions.ignoreUnknown)) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Unknown property "${key}" for ${instance.constructor.name} at [Source '${JSON.stringify(obj)}']`);
        }
      }

      // if there is a reference, convert the reference property to the corresponding Class
      for (const key in instance) {
        if (Object.hasOwnProperty.call(instance, key)) {
          this.parseJsonManagedReference(instance, options, obj, key);
        }
      }

      return instance;
    }
  }

  parseJsonPropertyAndJsonAlias(replacement: any, options: JsonParserOptions): void {
    const currentMainCreator = options.mainCreator()[0];
    // convert JsonProperty to Class properties
    const creatorMetadataKeys = Reflect.getMetadataKeys(currentMainCreator);

    for (const metadataKey of creatorMetadataKeys) {
      if (metadataKey.startsWith('jackson:JsonProperty:') || metadataKey.startsWith('jackson:JsonAlias:')) {

        const realKey = metadataKey.replace(
          metadataKey.startsWith('jackson:JsonProperty:') ? 'jackson:JsonProperty:' : 'jackson:JsonAlias:', '');
        const jsonProperty: JsonPropertyOptions = Reflect.getMetadata(metadataKey, currentMainCreator);
        const jsonAlias: JsonAliasOptions = Reflect.getMetadata(metadataKey, currentMainCreator);
        const hasJsonIgnore = Reflect.hasMetadata('jackson:JsonIgnore', currentMainCreator, realKey);

        const isIgnored = (jsonProperty && (jsonProperty.access === JsonPropertyAccess.READ_ONLY ||
          (jsonProperty.access === JsonPropertyAccess.AUTO && hasJsonIgnore))) || hasJsonIgnore;

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

  parseJsonRawValue(options: JsonParserOptions, replacement: any, key: string): void {
    const jsonRawValue = Reflect.hasMetadata('jackson:JsonRawValue', options.mainCreator()[0], key);
    if (jsonRawValue) {
      replacement[key] = JSON.stringify(replacement[key]);
    }
  }

  parseJsonRootName(replacement: any, options: JsonParserOptions): any {
    const jsonRootName: string = Reflect.getMetadata('jackson:JsonRootName', options.mainCreator()[0]);
    if (jsonRootName) {return replacement[jsonRootName]; }
    return replacement;
  }

  parseJsonClass(options: JsonParserOptions, obj: any, key: string): any {
    const jsonClass: JsonClassOptions = Reflect.getMetadata('jackson:JsonClass', options.mainCreator()[0], key);

    if (jsonClass && jsonClass.class) {
      const newOptions = {...options};
      newOptions.mainCreator = () => jsonClass.class();
      const newCreator = newOptions.mainCreator()[0];

      if (isClassIterableNoMap(newCreator)) {
        return this.parseIterable(obj[key], key, newOptions);
      }

      return this.deepParse(key, obj[key], newOptions);
    }
    return obj[key];
  }

  parseJsonManagedReference(replacement: any, options: JsonParserOptions, obj: any, key: string): void {
    const jsonManagedReference: JsonManagedReferenceOptions =
      Reflect.getMetadata('jackson:JsonManagedReference', replacement.constructor, key);
    const jsonClassManagedReference: JsonClassOptions =
      Reflect.getMetadata('jackson:JsonClass', replacement.constructor, key);

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
          Reflect.getMetadata('jackson:JsonBackReference:' + jsonManagedReference.value, backReferenceConstructor);

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
          Reflect.getMetadata('jackson:JsonBackReference:' + jsonManagedReference.value, childConstructor);
        if (jsonBackReference) {
          replacement[key][jsonBackReference.propertyKey] = replacement;
        }
      }
    } else if (jsonManagedReference && !jsonClassManagedReference) {
      // eslint-disable-next-line max-len
      throw new JacksonError(`Missing mandatory @JsonClass() annotation for the @JsonManagedReference() annotated ${replacement.constructor.name}["${key}"] field at [Source '${JSON.stringify(obj)}']`);
    }
  }

  parseJsonAnySetter(replacement: any, obj: any, key: string): void {
    const jsonAnySetter: JsonAnySetterPrivateOptions = Reflect.getMetadata('jackson:JsonAnySetter', replacement);
    if (jsonAnySetter && replacement[jsonAnySetter.propertyKey]) {
      if (typeof replacement[jsonAnySetter.propertyKey] === 'function') {
        replacement[jsonAnySetter.propertyKey](key, obj[key]);
      } else {
        replacement[jsonAnySetter.propertyKey][key] = obj[key];
      }
    }
  }

  parseJsonDeserialize(options: JsonParserOptions, replacement: any, key: string): void {
    const jsonDeserialize: (...args) => any = Reflect.getMetadata('jackson:JsonDeserialize', options.mainCreator()[0], key);
    if (jsonDeserialize) {
      replacement[key] = jsonDeserialize(replacement[key]);
    }
  }

  parseHasJsonIgnore(options: JsonParserOptions, key: string): boolean {
    const currentMainCreator = options.mainCreator()[0];
    const hasJsonIgnore = Reflect.hasMetadata('jackson:JsonIgnore', currentMainCreator, key);
    const hasJsonProperty = Reflect.hasMetadata('jackson:JsonProperty:' + key, currentMainCreator);

    if (!hasJsonIgnore) {
      const jsonIgnoreProperties: JsonIgnorePropertiesOptions = Reflect.getMetadata('jackson:JsonIgnoreProperties', currentMainCreator);
      if (jsonIgnoreProperties && !jsonIgnoreProperties.allowSetters) {
        if (jsonIgnoreProperties.value.includes(key)) {return true; }
        const jsonProperty: JsonPropertyOptions = Reflect.getMetadata('jackson:JsonProperty:' + key, currentMainCreator);
        if (jsonProperty && jsonIgnoreProperties.value.includes(jsonProperty.value)) {return true; }
      }
    }
    return hasJsonIgnore && !hasJsonProperty;
  }

  parseJsonIgnoreType(options: JsonParserOptions): boolean {
    return Reflect.hasMetadata('jackson:JsonIgnoreType', options.mainCreator()[0]);
  }

  parseJsonTypeInfo(obj: any, options: JsonParserOptions): any {
    const currentMainCreator = options.mainCreator()[0];
    const jsonTypeInfo: JsonTypeInfoOptions = Reflect.getMetadata('jackson:JsonTypeInfo', currentMainCreator);

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
        } else if (typeof obj[0] !== 'string') {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Expected "String", got "${obj[0].constructor.name}": need JSON String that contains type id (for subtype of "${currentMainCreator.name}") at [Source '${JSON.stringify(obj)}']`);
        }
        jsonTypeInfoProperty = obj[0];
        newObj = obj[1];
        break;
      }

      const jsonSubTypes: JsonSubTypeOptions[] = Reflect.getMetadata('jackson:JsonSubTypes', currentMainCreator);

      if (jsonSubTypes) {
        for (const subType of jsonSubTypes) {
          if (subType.name != null && jsonTypeInfoProperty === subType.name) {
            jsonTypeCtor = subType.class();
          } else {
            const ctor = Reflect.getMetadata('jackson:JsonTypeName:' + jsonTypeInfoProperty, subType.class());
            if (ctor) {
              jsonTypeCtor = ctor;
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
          if (jsonSubTypes) {
            ids.push(...jsonSubTypes.map((subType) => subType.class().name));
          }
          // eslint-disable-next-line max-len
          throw new JacksonError(`Could not resolve type id "${jsonTypeInfoProperty}" as a subtype of "${currentMainCreator.name}": known type ids = [${ids.join(', ')}] at [Source '${JSON.stringify(obj)}']`);
        }
        break;
      }

      options.mainCreator = () => [jsonTypeCtor[0]];
      return newObj;
    }

    return obj;
  }

  parseHasJsonView(options: JsonParserOptions, key: string): boolean {
    if (options.withView) {
      const jsonView: JsonViewOptions = Reflect.getMetadata('jackson:JsonView', options.mainCreator()[0], key);
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

  parseJsonUnwrapped(replacement: any, options: JsonParserOptions): void {
    const currentMainCreator = options.mainCreator()[0];
    const metadataKeys: string[] = Reflect.getMetadataKeys(currentMainCreator);
    for (const metadataKey of metadataKeys) {
      if (metadataKey.startsWith('jackson:JsonUnwrapped:')) {
        const realKey = metadataKey.replace('jackson:JsonUnwrapped:', '');
        const jsonUnwrapped: JsonUnwrappedOptions = Reflect.getMetadata(metadataKey, currentMainCreator);

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

  getInstanceAlreadySeen(key: string, value: any, options: JsonParserOptions): null | any {
    const currentMainCreator = options.mainCreator()[0];
    const jsonIdentityInfo: JsonIdentityInfoOptions = Reflect.getMetadata('jackson:JsonIdentityInfo', currentMainCreator);

    if (jsonIdentityInfo) {
      const id: string = typeof value === 'object' ? value[jsonIdentityInfo.property] : value;

      const scope: string = jsonIdentityInfo.scope || '';
      const scopedId = this.generateScopedId(scope, id);
      if (this._globalValueAlreadySeen.has(scopedId)) {
        const instance = this._globalValueAlreadySeen.get(scopedId);
        if (instance.constructor !== currentMainCreator) {
          throw new JacksonError(`Already had Class "${instance.constructor.name}" for id ${id}.`);
        }
        return instance;
      }
    }

    return null;
  }

  parseJsonIdentityInfo(replacement: any, obj: any, options: JsonParserOptions): void {
    const jsonIdentityInfo: JsonIdentityInfoOptions = Reflect.getMetadata('jackson:JsonIdentityInfo', options.mainCreator()[0]);

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

  parseIterable(iterable: any, key: string, options: JsonParserOptions): any {

    const currentCreators = options.mainCreator();
    const currentCreator = currentCreators[0];

    let newIterable: any;
    const newOptions = {...options};

    if (currentCreators.length > 1 && currentCreators[1] instanceof Array) {
      newOptions.mainCreator = () => currentCreators[1] as [ClassType<any>];
    } else {
      newOptions.mainCreator = null;
    }

    if (isSameConstructorOrExtensionOfNoObject(currentCreator, Set)) {
      if (isSameConstructor(currentCreator, Set)) {
        newIterable = new Set();
      } else {
        newIterable = new (currentCreator as ObjectConstructor)() as Set<any>;
      }
      for (const value of iterable) {
        if (newOptions.mainCreator == null) {
          newOptions.mainCreator = () => [(value || Object).constructor];
        }
        (newIterable as Set<any>).add(this.deepParse(key, value, newOptions));
      }
    } else {
      newIterable = [];
      for (const value of iterable) {
        if (newOptions.mainCreator == null) {
          newOptions.mainCreator = () => [(value || Object).constructor];
        }
        (newIterable as Array<any>).push(this.deepParse(key, value, newOptions));
      }
      if (!isSameConstructor(currentCreator, Array)) {
        // @ts-ignore
        newIterable = new currentCreator(newIterable);
      }
    }

    return newIterable;
  }

  parseMap(obj: any, options: JsonParserOptions): Map<any, any> {
    const currentCreators = options.mainCreator();
    const currentCreator = currentCreators[0];

    let map: Map<any, any>;

    const newOptions = {...options};

    if (currentCreators.length > 1 && currentCreators[1] instanceof Array) {
      newOptions.mainCreator = () => currentCreators[1] as [ClassType<any>];
    } else {
      newOptions.mainCreator = null;
    }

    if (isSameConstructor(currentCreator, Map)) {
      map = new Map();
    } else {
      map = new (currentCreator as ObjectConstructor)() as Map<any, any>;
    }

    const keyNewOptions = {...newOptions};
    const valueNewOptions = {...newOptions};

    if (newOptions.mainCreator != null) {
      const mapCurrentCreators = newOptions.mainCreator();
      keyNewOptions.mainCreator = () => [mapCurrentCreators[0]];
      if (mapCurrentCreators.length > 1) {
        if (mapCurrentCreators[1] instanceof Array) {
          valueNewOptions.mainCreator = () => mapCurrentCreators[1] as [ClassType<any>];
        } else {
          valueNewOptions.mainCreator = () => [mapCurrentCreators[1]] as [ClassType<any>];
        }
      } else {
        valueNewOptions.mainCreator = () => [Object];
      }
    } else {
      keyNewOptions.mainCreator = () => [Object];
      valueNewOptions.mainCreator = () => [Object];
    }

    // eslint-disable-next-line guard-for-in
    for (const key in obj) {
      map.set(key, this.deepParse(key, obj[key], valueNewOptions));
    }

    return map;
  }

  private deepParse(key: string, value: any, options: JsonParserOptions): any {

    value = this.invokeCustomDeserializers(key, value, options);

    if (value != null) {

      let instance = this.getInstanceAlreadySeen(key, value, options);
      if (instance != null) {
        return instance;
      }

      value = this.parseJsonTypeInfo(value, options);

      const currentConstructor = options.mainCreator()[0];

      if (isSameConstructorOrExtensionOfNoObject(currentConstructor, Map)) {
        value = this.parseMap(value, options);
      } else if (BigInt && isSameConstructorOrExtensionOfNoObject(currentConstructor, BigInt)) {
        return (typeof value === 'string' && value.endsWith('n')) ?
          (currentConstructor as ObjectConstructor)(value.substring(0, value.length - 1)) :
          (currentConstructor as ObjectConstructor)(value);
      } else if (isSameConstructorOrExtensionOfNoObject(currentConstructor, RegExp) ||
        isSameConstructorOrExtensionOfNoObject(currentConstructor, Date)) {
        return new (currentConstructor as ObjectConstructor)(value);
      } else if (typeof value === 'object' && !isIterableNoMapNoString(value)) {

        if (this.parseJsonIgnoreType(options)) {
          return null;
        }

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
              this.parseJsonDeserialize(options, replacement,  k);
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

  private generateScopedId(scope: string, id: string): string {
    return scope + ': ' + id;
  }
}
