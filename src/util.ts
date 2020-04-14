import {parse} from '@babel/parser';
import {
  ClassDeclaration,
  ClassMethod,
  ExpressionStatement, FunctionDeclaration,
  FunctionExpression,
  Node
} from '@babel/types';
import {
  ClassType, JsonAliasOptions,
  JsonDecorator,
  JsonDecoratorOptions, JsonParserTransformerContext,
  JsonStringifierParserCommonContext, JsonStringifierTransformerContext
} from './@types';
import 'reflect-metadata';
import {JsonGetterPrivateOptions, JsonPropertyPrivateOptions, JsonSetterPrivateOptions} from './@types/private';

/**
 * https://stackoverflow.com/a/43197340/4637638
 * @internal
 */
export const isClass = (obj): boolean => {
  const isCtorClass = obj.constructor
      && obj.constructor.toString().substring(0, 5) === 'class';

  if (obj.prototype === undefined) {
    return isCtorClass || !isFunction(obj);
  }
  const isPrototypeCtorClass = obj.prototype.constructor
    && obj.prototype.constructor.toString
    && obj.prototype.constructor.toString().substring(0, 5) === 'class';
  return isCtorClass || isPrototypeCtorClass || !isFunction(obj);
};

/**
 * https://stackoverflow.com/a/56035104/4637638
 * @internal
 */
export const isFunction = (funcOrClass: any): boolean => {
  const propertyNames = Object.getOwnPropertyNames(funcOrClass);
  return (!propertyNames.includes('prototype') || propertyNames.includes('arguments'));
};

/**
 * @internal
 */
export const makeDecorator = <T>(
  options: (...args: any[]) => JsonDecoratorOptions,
  decorator: JsonDecorator): any => {
  const DecoratorFactory = (...args: any[]): any => {
    const target: Record<string, any> = args[0];
    const propertyKey: null | string | symbol = args[1];
    const descriptorOrParamIndex: null | number | TypedPropertyDescriptor<any> = args[2];

    if ((typeof target === 'function' || propertyKey != null || descriptorOrParamIndex != null) ||
      descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      return decorator(options(), target, propertyKey, descriptorOrParamIndex);
    } else {
      return <T>(targetDecorator: Record<string, any>,
        propertyKeyDecorator?: string | symbol,
        descriptor?: TypedPropertyDescriptor<T>): any =>
        decorator(options(args[0]), targetDecorator, propertyKeyDecorator, descriptor);
    }
  };
  return DecoratorFactory;
};

/**
 * @internal
 */
export const makeJacksonDecorator = <T>(
  options: (...args: any[]) => JsonDecoratorOptions,
  decorator: JsonDecorator): any => makeDecorator<T>(
  options,
  (o: JsonDecoratorOptions, target, propertyKey, descriptorOrParamIndex) => {
    const value = decorator(o, target, propertyKey, descriptorOrParamIndex);
    if (value != null) {
      return value;
    }
    if (typeof descriptorOrParamIndex !== 'number') {
      return descriptorOrParamIndex;
    }
  });

/**
 * https://github.com/rphansen91/es-arguments/blob/master/src/arguments.js#L3
 * @internal
 */
const pluckPattern = (pattern): string => ['{',
  pattern.map(({ key }) => key.name).join(', '),
  '}'].join(' ');

/**
 * https://github.com/rphansen91/es-arguments/blob/master/src/arguments.js#L9
 * @internal
 */
const pluckParamName = (param): string => {
  if (param.name) {return param.name; }
  if (param.left) {return pluckParamName(param.left); }
  if (param.properties) {return pluckPattern(param.properties); }
  if (param.type === 'RestElement') {return '...' + pluckParamName(param.argument); }
  return;
};

/**
 * @internal
 */
export interface GetClassPropertiesOptions {
  /**
   * Class properties with Getters method/property name.
   *
   * If {@link withGetterVirtualProperties} is `false`, then the
   * property the Getter is referencing will be deleted from the
   * Class properties.
   */
  withGettersAsProperty?: boolean;
  withGetterVirtualProperties?: boolean;
  /**
   * Class properties with Setters method/property name.
   *
   * If {@link withSetterVirtualProperties} is `false`, then the
   * property the Setter is referencing will be deleted from the
   * Class properties.
   */
  withSettersAsProperty?: boolean;
  withSetterVirtualProperties?: boolean;
  withJsonVirtualPropertyValues?: boolean;
  withJsonAliases?: boolean;
}

/**
 * @internal
 */
export const getClassProperties = (target: Record<string, any>, obj: any = null, options: GetClassPropertiesOptions = {}): string[] => {
  options = {
    withGettersAsProperty: false,
    withGetterVirtualProperties: false,
    withSettersAsProperty: false,
    withSetterVirtualProperties: false,
    withJsonVirtualPropertyValues: false,
    withJsonAliases: false,
    ...options
  };

  let objKeys = [];
  if (obj != null) {
    objKeys = Object.getOwnPropertyNames(obj);
    if (objKeys.includes('constructor') &&
      typeof obj.constructor === 'function' &&
      !obj.constructor.toString().endsWith('{ [native code] }') &&
      obj.constructor.constructor.toString().endsWith('{ [native code] }')) {
      objKeys.splice(objKeys.indexOf('constructor'), 1);
    }
  }

  const keysToBeDeleted = new Set<string>();
  const metadataKeys = Reflect.getMetadataKeys(target);
  let classProperties: Set<string> = new Set(objKeys);

  for (const metadataKey of metadataKeys) {
    if (metadataKey.startsWith('jackson:JsonVirtualProperty:')) {
      const jsonVirtualProperty: JsonPropertyPrivateOptions | JsonGetterPrivateOptions | JsonSetterPrivateOptions =
        Reflect.getMetadata(metadataKey, target);

      if (jsonVirtualProperty && jsonVirtualProperty.descriptor != null && typeof jsonVirtualProperty.descriptor.value === 'function') {
        if (jsonVirtualProperty.propertyKey.startsWith('get')) {
          if (options.withGetterVirtualProperties) {
            classProperties.add(jsonVirtualProperty.value);
          }
          if (!options.withGettersAsProperty) {
            continue;
          } else if (!options.withGetterVirtualProperties) {
            keysToBeDeleted.add(jsonVirtualProperty.value);
          }
        }
        if (jsonVirtualProperty.propertyKey.startsWith('set')) {
          if (options.withSetterVirtualProperties) {
            classProperties.add(jsonVirtualProperty.value);
          }
          if (!options.withSettersAsProperty) {
            continue;
          } else if (!options.withSetterVirtualProperties) {
            keysToBeDeleted.add(jsonVirtualProperty.value);
          }
        }
      }
      classProperties.add(jsonVirtualProperty.propertyKey);
      if (options.withJsonVirtualPropertyValues && jsonVirtualProperty.value != null) {
        classProperties.add(jsonVirtualProperty.value);
      }
    } else if (metadataKey.startsWith('jackson:JsonAlias:') && options.withJsonAliases) {
      const propertyKey = metadataKey.replace('jackson:JsonAlias:', '');
      classProperties.add(propertyKey);
      const jsonAlias: JsonAliasOptions = Reflect.getMetadata(metadataKey, target);
      if (jsonAlias.values != null) {
        for (const alias of jsonAlias.values) {
          classProperties.add(alias);
        }
      }
    }
  }

  classProperties = new Set([...classProperties].filter((key) => !keysToBeDeleted.has(key)));

  let parent = target;
  while (parent.name && parent !== Object) {
    const propertyDescriptors = Object.getOwnPropertyDescriptors(parent.prototype);
    // eslint-disable-next-line guard-for-in
    for (const property in propertyDescriptors) {
      const propertyDescriptor = propertyDescriptors[property];
      if (propertyDescriptor.get != null || propertyDescriptor.set != null) {
        classProperties.add(property);
      }
    }
    parent = Object.getPrototypeOf(parent);
  }

  return [...classProperties];
};

/**
 * @internal
 */
export const classHasOwnProperty = (target: Record<string, any>, propertyKey: string, obj?: any,
                                    options?: GetClassPropertiesOptions): boolean => {
  const classProperties = getClassProperties(target, obj, options);
  return classProperties.includes(propertyKey);
};

/**
 * @internal
 */
export interface VirtualPropertiesToClassPropertiesMappingOptions {
  checkGetters?: boolean;
  checkSetters?: boolean;
}

/**
 * @internal
 */
export const mapVirtualPropertiesToClassProperties =
  (target: Record<string, any>, keys: string[],
   options: VirtualPropertiesToClassPropertiesMappingOptions): string[] =>
    [...virtualPropertiesToClassPropertiesMapping(target, keys, options).values()];

/**
 * @internal
 */
export const virtualPropertiesToClassPropertiesMapping =
  (target: Record<string, any>, keys: string[],
   options: VirtualPropertiesToClassPropertiesMappingOptions): Map<string, string> => {
    options = {
      checkGetters: false,
      checkSetters: false,
      ...options
    };

    const metadataKeys = Reflect.getMetadataKeys(target);
    const propertiesMapping: Map<string, string> = new Map();

    for (const key of keys) {
      let getterOrSetterFound = false;
      for (const metadataKey of metadataKeys) {
        if (metadataKey.startsWith('jackson:JsonVirtualProperty:')) {
          const jsonVirtualProperty: JsonPropertyPrivateOptions | JsonGetterPrivateOptions | JsonSetterPrivateOptions =
            Reflect.getMetadata(metadataKey, target);

          if (jsonVirtualProperty.value !== key) {
            continue;
          }

          if (jsonVirtualProperty && jsonVirtualProperty.descriptor != null && typeof jsonVirtualProperty.descriptor.value === 'function') {
            if ((options.checkGetters && jsonVirtualProperty.propertyKey.startsWith('get')) ||
              (options.checkSetters && jsonVirtualProperty.propertyKey.startsWith('set'))) {
              propertiesMapping.set(key, jsonVirtualProperty.propertyKey);
              getterOrSetterFound = true;
              break;
            }
          }
        }
      }
      if (!getterOrSetterFound) {
        propertiesMapping.set(key, key);
      }
    }
    return propertiesMapping;
  };

/**
 * @internal
 */
export const mapVirtualPropertyToClassProperty =
  (target: Record<string, any>, key: string, options: VirtualPropertiesToClassPropertiesMappingOptions): string =>
    mapVirtualPropertiesToClassProperties(target, [key], options)[0];

/**
 * @internal
 */
export const mapClassPropertiesToVirtualProperties =
  (target: Record<string, any>, classProperties: string[]): string[] =>
    [...classPropertiesToVirtualPropertiesMapping(target, classProperties).values()];

/**
 * @internal
 */
export const classPropertiesToVirtualPropertiesMapping =
  (target: Record<string, any>, classProperties: string[]): Map<string, string> => {

    const propertiesMapping: Map<string, string> = new Map();

    for (const classProperty of classProperties) {
      const jsonVirtualProperty: JsonPropertyPrivateOptions | JsonGetterPrivateOptions | JsonSetterPrivateOptions =
        Reflect.getMetadata('jackson:JsonVirtualProperty:' + classProperty, target);
      if (jsonVirtualProperty) {
        propertiesMapping.set(classProperty, jsonVirtualProperty.value);
      } else {
        propertiesMapping.set(classProperty, classProperty);
      }
    }
    return propertiesMapping;
  };

/**
 * @internal
 */
export const mapClassPropertyToVirtualProperty =
  (target: Record<string, any>, key: string): string =>
    mapClassPropertiesToVirtualProperties(target, [key])[0];

/**
 * @internal
 */
export const getArgumentNames = (method): string[] => {
  let code = method.toString().trim();

  if (code.endsWith(' { [native code] }')) {
    return [];
  }

  if (code.startsWith('class extends')) {
    code = 'class JacksonClass ' + code.substring(6);
  } else if (code.startsWith('function (')) {
    code = 'function JacksonFunction ' + code.substring(9);
  } else if (!code.startsWith('class ') && !code.startsWith('function ')) {
    code = 'function ' + code;
  }

  const ast = parse(code, {
    plugins: ['typescript']
  });

  const { body } = ast.program;

  let nodes: Node[] = [];
  if (code.startsWith('class ')) {
    nodes = (body[0] as ClassDeclaration).body.body;
    // find constructor
    for (const propertyOrMethod of nodes) {
      if ((propertyOrMethod as ClassMethod).kind === 'constructor') {
        nodes = [propertyOrMethod as ClassMethod];
        break;
      }
    }
  } else {
    nodes = [body[0] as FunctionDeclaration];
  }

  return nodes.reduce((args, exp) => {
    if ((exp as ClassMethod | FunctionDeclaration).params) {
      return args.concat((exp as ClassMethod).params);
    }
    if (((exp as ExpressionStatement).expression as FunctionExpression).params) {
      return args.concat(((exp as ExpressionStatement).expression as FunctionExpression).params);
    }
    return args;
  }, []).map(pluckParamName);
};

/**
 * @internal
 */
export const isSameConstructor = (ctorOrCtorName, ctor2): boolean =>
  (typeof ctorOrCtorName === 'string' && ctorOrCtorName === ctor2.name) || ctorOrCtorName === ctor2;

/**
 * @internal
 */
export const isExtensionOf = (ctor, ctorExtensionOf): boolean => {
  if (typeof ctor === 'string') {
    let parent = Object.getPrototypeOf(ctorExtensionOf);
    while (parent.name) {
      if (parent.name === ctor) {
        return true;
      }
      // get parent class
      parent = Object.getPrototypeOf(parent);
    }
  } else {
    return ctor !== ctorExtensionOf && ctorExtensionOf.prototype instanceof ctor;
  }
  return false;
};

/**
 * @internal
 */
export const isSameConstructorOrExtensionOf = (ctorOrCtorName, ctor2): boolean =>
  (isSameConstructor(ctorOrCtorName, ctor2) || isExtensionOf(ctorOrCtorName, ctor2));

/**
 * @internal
 */
export const isSameConstructorOrExtensionOfNoObject = (ctorOrCtorName, ctor2): boolean =>
  ctorOrCtorName !== Object && (isSameConstructor(ctorOrCtorName, ctor2) || isExtensionOf(ctorOrCtorName, ctor2));

/**
 * @internal
 */
export const hasIterationProtocol = (variable): boolean =>
  variable !== null && Symbol.iterator in Object(variable);

/**
 * @internal
 */
export const isIterableNoMapNoString = (variable): boolean =>
  typeof variable !== 'string' &&
  !(isSameConstructorOrExtensionOfNoObject(variable.constructor, Map)) &&
  hasIterationProtocol(variable);

/**
 * @internal
 */
export const isIterableNoString = (variable): boolean =>
  typeof variable !== 'string' &&
  hasIterationProtocol(variable);

/**
 * @internal
 */
export const isClassIterableNoMap = (ctor: ClassType<any>): boolean =>
  !(isSameConstructorOrExtensionOfNoObject(ctor, Map)) &&
  hasIterationProtocol(ctor.prototype);

/**
 * @internal
 */
export const isClassIterableNoMapNoString = (ctor: ClassType<any>): boolean =>
  !(isSameConstructorOrExtensionOfNoObject(ctor, String)) &&
  !(isSameConstructorOrExtensionOfNoObject(ctor, Map)) &&
  hasIterationProtocol(ctor.prototype);

/**
 * @internal
 */
export const isClassIterable = (ctor: ClassType<any>): boolean => hasIterationProtocol(ctor.prototype);

/**
 * https://stackoverflow.com/a/1482209/4637638
 * @internal
 */
export const isObjLiteral = (_obj: any): boolean => {
  let _test  = _obj;
  return ( typeof _obj !== 'object' || _obj === null ?
    false :
    (
      (() => {
        while (true) {
          if (  Object.getPrototypeOf( _test = Object.getPrototypeOf(_test)  ) === null) {
            break;
          }
        }
        return Object.getPrototypeOf(_obj) === _test;
      })()
    )
  );
};

/**
 * https://stackoverflow.com/a/3886106/4637638
 * @internal
 */
export const isInt = (n: number) => Number(n) === n && n % 1 === 0;

/**
 * https://stackoverflow.com/a/3886106/4637638
 * @internal
 */
export const isFloat = (n: number) => Number(n) === n && n % 1 !== 0;

/**
 * find metadata considering also _internalDecorators
 * @internal
 */
export const findMetadata = <T extends JsonDecoratorOptions>(metadataKey: string,
  target: Record<string, any>,
  propertyKey?: string | symbol | null,
  context?: JsonStringifierParserCommonContext<any>): T => {
  let jsonDecoratorOptions: JsonDecoratorOptions = (propertyKey) ?
    Reflect.getMetadata(metadataKey, target, propertyKey) : Reflect.getMetadata(metadataKey, target);

  // search also on its prototype chain
  while (jsonDecoratorOptions == null && target.name) {
    if (jsonDecoratorOptions == null && propertyKey == null && context != null && context._internalDecorators != null) {
      const map = context._internalDecorators.get(target as ObjectConstructor);
      if (map != null && metadataKey in map) {
        jsonDecoratorOptions = map[metadataKey] as JsonDecoratorOptions;
      }
    }
    // get parent class
    target = Object.getPrototypeOf(target);
  }
  return jsonDecoratorOptions as T;
};

/**
 * @internal
 */
export const getMetadata = <T extends JsonDecoratorOptions>(metadataKey: string,
  target: Record<string, any>,
  propertyKey?: string | symbol | null,
  context?: JsonStringifierParserCommonContext<any>): T => {
  const jsonjsonDecoratorOptions: JsonDecoratorOptions = findMetadata(metadataKey, target, propertyKey, context);

  if (jsonjsonDecoratorOptions != null && context != null && context.decoratorsEnabled != null) {
    const decoratorKeys = Object.keys(context.decoratorsEnabled);
    const decoratorKey = decoratorKeys.find((key) => metadataKey.startsWith('jackson:' + key));
    if (decoratorKey && typeof context.decoratorsEnabled[decoratorKey] === 'boolean') {
      jsonjsonDecoratorOptions.enabled = context.decoratorsEnabled[decoratorKey];
    }
  }
  return jsonjsonDecoratorOptions != null && jsonjsonDecoratorOptions.enabled ? jsonjsonDecoratorOptions as T : undefined;
};

/**
 * find all metadataKeys considering also _internalDecorators
 * @internal
 */
export const findMetadataKeys = <T extends JsonDecoratorOptions>(target: Record<string, any>,
  context?: JsonStringifierParserCommonContext<any>): any[] => {
  const metadataKeys = new Set(Reflect.getMetadataKeys(target));

  if (context != null && context._internalDecorators != null) {
    // search also on its prototype chain
    let parent = target;
    while (parent.name) {
      const internalDecorators = context._internalDecorators.get(parent as ObjectConstructor);
      for (const key in internalDecorators) {
        if (key === 'depth') {
          continue;
        }
        metadataKeys.add(key);
      }
      // get parent class
      parent = Object.getPrototypeOf(parent);
    }
  }

  return [...metadataKeys];
};

/**
 * @internal
 */
export const getMetadataKeys = <T extends JsonDecoratorOptions>(target: Record<string, any>,
  context?: JsonStringifierParserCommonContext<any>): any[] => {
  let metadataKeys = findMetadataKeys(target, context);

  if (context != null && context.decoratorsEnabled != null) {
    const decoratorKeys = Object.keys(context.decoratorsEnabled);
    metadataKeys = metadataKeys.filter((metadataKey) => {
      const decoratorKey = decoratorKeys.find((key) => metadataKey.startsWith('jackson:' + key));
      return context.decoratorsEnabled[decoratorKey] == null || context.decoratorsEnabled[decoratorKey];
    });
  }
  return metadataKeys;
};

/**
 * @internal
 */
export const hasMetadata = <T extends JsonDecoratorOptions>(metadataKey: string,
  target: Record<string, any>,
  propertyKey?: string | symbol | null,
  context?: JsonStringifierParserCommonContext<any>): boolean => {
  const option: JsonDecoratorOptions = getMetadata<T>(metadataKey, target, propertyKey, context);
  return option != null;
};

/**
 * @internal
 */
export const isVariablePrimitiveType = (value: any): boolean => value != null && isConstructorPrimitiveType(value.constructor);

/**
 * @internal
 */
export const isConstructorPrimitiveType = (ctor: any): boolean => ctor === Number ||
  (BigInt && ctor === BigInt) || ctor === String ||
  ctor === Boolean || (Symbol && ctor === Symbol);

/**
 * @internal
 */
export const getDefaultPrimitiveTypeValue = (ctor: ClassType<any>): any | null => {
  switch (ctor) {
  case Number:
    return 0;
  case Boolean:
    return false;
  case String:
    return '';
  default:
    if (BigInt && ctor === BigInt) {
      return BigInt(0);
    }
  }
  return null;
};

/**
 * @internal
 */
export const getDefaultValue = (value: any): any | null => {
  if (value != null) {
    return getDefaultPrimitiveTypeValue(value.constructor);
  }
  return null;
};

/**
 * @internal
 */
export const isValueEmpty = (value: any): boolean => value == null ||
  ( (value instanceof Set || value instanceof Map) && value.size === 0 ) ||
  ( !(value instanceof Set || value instanceof Map) &&
    (typeof value === 'object' || typeof value === 'string') && Object.keys(value).length === 0 );

/**
 * @internal
 */
export const getDeepestClass = (array: Array<any>): any | null => {
  if (array == null || array.length === 0) {
    return null;
  }
  if (!(array[array.length - 1] instanceof Array)) {
    return array[array.length - 1];
  }
  return getDeepestClass(array[array.length - 1]);
};

/**
 * @internal
 */
export const getObjectKeysWithPropertyDescriptorNames = (obj: any, ctor?: any, options?: GetClassPropertiesOptions): string[] => {
  if (obj == null) {
    return [];
  }
  const keys = Object.getOwnPropertyNames(obj);
  const classProperties = getClassProperties(ctor != null ? ctor : obj.constructor, options);

  if (keys.includes('constructor') &&
    typeof obj.constructor === 'function' &&
    !obj.constructor.toString().endsWith('{ [native code] }') &&
    obj.constructor.constructor.toString().endsWith('{ [native code] }')) {
    keys.splice(keys.indexOf('constructor'), 1);
  }

  return [...new Set([...keys, ...classProperties])];
};

/**
 * @internal
 */
export const objectHasOwnPropertyWithPropertyDescriptorNames =
  (obj: any, ctor: any, key: string, options?: GetClassPropertiesOptions): boolean => {
    if (obj == null || key == null) {
      return false;
    }
    return getObjectKeysWithPropertyDescriptorNames(obj, ctor, options).includes(key);
  };
