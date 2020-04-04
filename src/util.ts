import {parse, ParserPlugin} from '@babel/parser';
import {
  CallExpression,
  ClassDeclaration,
  ClassMethod,
  ExpressionStatement, FunctionDeclaration,
  FunctionExpression, Identifier, MemberExpression,
  Node
} from '@babel/types';
import {
  ClassType, JsonAliasOptions,
  JsonAnnotationDecorator,
  JsonAnnotationOptions,
  JsonParserOptions, JsonPropertyOptions,
  JsonStringifierOptions, JsonStringifierParserCommonOptions
} from './@types';
import 'reflect-metadata';

/**
 * https://stackoverflow.com/a/43197340/4637638
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
 */
export const isFunction = (funcOrClass: any): boolean => {
  const propertyNames = Object.getOwnPropertyNames(funcOrClass);
  return (!propertyNames.includes('prototype') || propertyNames.includes('arguments'));
};

export const makeDecorator = <T>(
  options: (...args: any[]) => JsonAnnotationOptions,
  decorator: JsonAnnotationDecorator): any => {
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

export const makeJacksonDecorator = <T>(
  options: (...args: any[]) => JsonAnnotationOptions,
  decorator: JsonAnnotationDecorator): any => makeDecorator<T>(
  options,
  (o: JsonAnnotationOptions, target, propertyKey, descriptorOrParamIndex) => {
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
 */
const pluckPattern = (pattern): string => ['{',
  pattern.map(({ key }) => key.name).join(', '),
  '}'].join(' ');

/**
 * https://github.com/rphansen91/es-arguments/blob/master/src/arguments.js#L9
 */
const pluckParamName = (param): string => {
  if (param.name) {return param.name; }
  if (param.left) {return pluckParamName(param.left); }
  if (param.properties) {return pluckPattern(param.properties); }
  if (param.type === 'RestElement') {return '...' + pluckParamName(param.argument); }
  return;
};

export const getClassProperties = (target: Record<string, any>, options = {
  withJsonProperties: false,
  withJsonAliases: false
}): string[] => {
  const metadataKeys = Reflect.getMetadataKeys(target);
  const classProperties: Set<string> = new Set();
  for (const metadataKey of metadataKeys) {
    if (metadataKey.startsWith('jackson:JsonProperty:')) {
      const propertyKey = metadataKey.replace('jackson:JsonProperty:', '');
      classProperties.add(propertyKey);
      if (options.withJsonProperties) {
        const jsonProperty: JsonPropertyOptions = Reflect.getMetadata(metadataKey, target);
        if (jsonProperty.value != null) {
          classProperties.add(jsonProperty.value);
        }
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

  let parent = target;
  while (parent.name && parent !== Object) {
    const propertyDescriptors =  Object.getOwnPropertyDescriptors(parent.prototype);
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

export const classHasOwnProperty = (target: Record<string, any>, propertyKey: string,
                                    options?: JsonStringifierParserCommonOptions<any>): boolean => {
  const metadataKeys = getMetadataKeys(target, options);
  if (metadataKeys.includes('jackson:JsonProperty:' + propertyKey)) {
    return true;
  }

  let parent = target;
  while (parent.name && parent !== Object) {
    const propertyDescriptors =  Object.getOwnPropertyDescriptors(parent.prototype);
    // eslint-disable-next-line guard-for-in
    for (const property in propertyDescriptors) {
      const propertyDescriptor = propertyDescriptors[property];
      if (propertyDescriptor.get != null || propertyDescriptor.set != null && property === propertyKey) {
        return true;
      }
    }
    parent = Object.getPrototypeOf(parent);
  }

  return false;
};

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

export const isSameConstructor = (ctorOrCtorName, ctor2): boolean =>
  (typeof ctorOrCtorName === 'string' && ctorOrCtorName === ctor2.name) || ctorOrCtorName === ctor2;

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

export const isSameConstructorOrExtensionOf = (ctorOrCtorName, ctor2): boolean =>
  (isSameConstructor(ctorOrCtorName, ctor2) || isExtensionOf(ctorOrCtorName, ctor2));

export const isSameConstructorOrExtensionOfNoObject = (ctorOrCtorName, ctor2): boolean =>
  ctorOrCtorName !== Object && (isSameConstructor(ctorOrCtorName, ctor2) || isExtensionOf(ctorOrCtorName, ctor2));

export const hasIterationProtocol = (variable): boolean =>
  variable !== null && Symbol.iterator in Object(variable);

export const isIterableNoMapNoString = (variable): boolean =>
  typeof variable !== 'string' &&
  !(isSameConstructorOrExtensionOfNoObject(variable.constructor, Map)) &&
  hasIterationProtocol(variable);

export const isIterableNoString = (variable): boolean =>
  typeof variable !== 'string' &&
  hasIterationProtocol(variable);

export const isClassIterableNoMap = (ctor: ClassType<any>): boolean =>
  !(isSameConstructorOrExtensionOfNoObject(ctor, Map)) &&
  hasIterationProtocol(ctor.prototype);

export const isClassIterableNoMapNoString = (ctor: ClassType<any>): boolean =>
  !(isSameConstructorOrExtensionOfNoObject(ctor, String)) &&
  !(isSameConstructorOrExtensionOfNoObject(ctor, Map)) &&
  hasIterationProtocol(ctor.prototype);

export const isClassIterable = (ctor: ClassType<any>): boolean => hasIterationProtocol(ctor.prototype);

/**
 * https://stackoverflow.com/a/1482209/4637638
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
 */
export const isInt = (n: number) => Number(n) === n && n % 1 === 0;
export const isFloat = (n: number) => Number(n) === n && n % 1 !== 0;

// find metadata considering also _internalAnnotations
export const findMetadata = <T extends JsonAnnotationOptions>(metadataKey: string,
  target: Record<string, any>,
  propertyKey?: string | symbol | null,
  options?: JsonStringifierParserCommonOptions<any>): T => {
  let jsonAnnotationOptions: JsonAnnotationOptions = (propertyKey) ?
    Reflect.getMetadata(metadataKey, target, propertyKey) : Reflect.getMetadata(metadataKey, target);

  // search also on its prototype chain
  while (jsonAnnotationOptions == null && target.name && target !== Object) {
    if (jsonAnnotationOptions == null && propertyKey == null && options != null && options._internalAnnotations != null) {
      const map = options._internalAnnotations.get(target as ObjectConstructor);
      if (map != null && metadataKey in map) {
        jsonAnnotationOptions = map[metadataKey] as JsonAnnotationOptions;
      }
    }
    // get parent class
    target = Object.getPrototypeOf(target);
  }
  return jsonAnnotationOptions as T;
};

export const getMetadata = <T extends JsonAnnotationOptions>(metadataKey: string,
  target: Record<string, any>,
  propertyKey?: string | symbol | null,
  options?: JsonStringifierParserCommonOptions<any>): T => {
  const jsonAnnotationOptions: JsonAnnotationOptions = findMetadata(metadataKey, target, propertyKey, options);

  if (jsonAnnotationOptions != null && options != null && options.annotationsEnabled != null) {
    const annotationKeys = Object.keys(options.annotationsEnabled);
    const annotationKey = annotationKeys.find((key) => metadataKey.startsWith('jackson:' + key));
    if (annotationKey && typeof options.annotationsEnabled[annotationKey] === 'boolean') {
      jsonAnnotationOptions.enabled = options.annotationsEnabled[annotationKey];
    }
  }
  return jsonAnnotationOptions != null && jsonAnnotationOptions.enabled ? jsonAnnotationOptions as T : undefined;
};

// find all metadataKeys considering also _internalAnnotations
export const findMetadataKeys = <T extends JsonAnnotationOptions>(target: Record<string, any>,
  options?: JsonStringifierParserCommonOptions<any>): any[] => {
  const metadataKeys = new Set(Reflect.getMetadataKeys(target));

  if (options != null && options._internalAnnotations != null) {
    // search also on its prototype chain
    let parent = target;
    while (parent.name && parent !== Object) {
      const internalAnnotations = options._internalAnnotations.get(parent as ObjectConstructor);
      for (const key in internalAnnotations) {
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

export const getMetadataKeys = <T extends JsonAnnotationOptions>(target: Record<string, any>,
  options?: JsonStringifierParserCommonOptions<any>): any[] => {
  let metadataKeys = findMetadataKeys(target, options);

  if (options != null && options.annotationsEnabled != null) {
    const annotationKeys = Object.keys(options.annotationsEnabled);
    metadataKeys = metadataKeys.filter((metadataKey) => {
      const annotationKey = annotationKeys.find((key) => metadataKey.startsWith('jackson:' + key));
      return options.annotationsEnabled[annotationKey] == null || options.annotationsEnabled[annotationKey];
    });
  }
  return metadataKeys;
};

export const hasMetadata = <T extends JsonAnnotationOptions>(metadataKey: string,
  target: Record<string, any>,
  propertyKey?: string | symbol | null,
  options?: JsonStringifierParserCommonOptions<any>): boolean => {
  const option: JsonAnnotationOptions = getMetadata<T>(metadataKey, target, propertyKey, options);
  return option != null;
};

export const isVariablePrimitiveType = (value: any): boolean => value != null && isConstructorPrimitiveType(value.constructor);

export const isConstructorPrimitiveType = (ctor: any): boolean => ctor === Number ||
  (BigInt && ctor === BigInt) || ctor === String ||
  ctor === Boolean || (Symbol && ctor === Symbol);

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
    } else if (Symbol && ctor === Symbol) {
      return Symbol();
    }
  }
  return null;
};

export const getDefaultValue = (value: any): any | null => {
  if (value != null) {
    return getDefaultPrimitiveTypeValue(value.constructor);
  }
  return null;
};

export const isValueEmpty = (value: any): boolean => value == null ||
  ( (value instanceof Set || value instanceof Map) && value.size === 0 ) ||
  ( !(value instanceof Set || value instanceof Map) &&
    (typeof value === 'object' || typeof value === 'string') && Object.keys(value).length === 0 );

export const getDeepestClass = (array: Array<any>): any | null => {
  if (array.length === 0) {
    return null;
  }
  if (array.length === 1) {
    return array[0];
  }
  return getDeepestClass(array[array.length - 1]);
};

export const getObjectKeysWithPropertyDescriptorNames = (obj: any): string[] => {
  if (obj == null) {
    return [];
  }
  const keys = Object.keys(obj);
  const classProperties = getClassProperties(obj.constructor);
  return [...new Set([...keys, ...classProperties])];
};

export const objectHasOwnPropertyWithPropertyDescriptorNames = (obj: any, key: string): boolean => {
  if (obj == null || key == null) {
    return false;
  }
  return getObjectKeysWithPropertyDescriptorNames(obj).includes(key);
};
