import {parse, ParserPlugin} from '@babel/parser';
import {
  CallExpression,
  ClassDeclaration,
  ClassMethod,
  ExpressionStatement, FunctionDeclaration,
  FunctionExpression, Identifier, MemberExpression,
  Node
} from '@babel/types';
import {ClassType, JsonAnnotationDecorator, JsonAnnotationOptions} from './@types';
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

export const getClassProperties = (clazz: ObjectConstructor | ClassType<any>): string[] => {
  const classCode = clazz.toString().trim();
  const classProperties = [];

  if (!classCode.startsWith('class ') &&
    !classCode.startsWith('function ' + clazz.name) &&
    !classCode.endsWith(' { [native code] }')) {
    return classProperties;
  }

  const ast = parse(classCode);

  const { body } = ast.program;
  let expressionStatements: ExpressionStatement[] = [];
  if (classCode.startsWith('class ')) {
    const nodes: Node[] = (body[0] as ClassDeclaration).body.body;
    // find constructor
    for (const propertyOrMethod of nodes) {
      if ((propertyOrMethod as ClassMethod).kind === 'constructor') {
        const ctor = propertyOrMethod as ClassMethod;
        expressionStatements = ctor.body.body as ExpressionStatement[];
        break;
      }
    }
  } else {
    expressionStatements = (body[0] as FunctionDeclaration).body.body as ExpressionStatement[];
  }

  for (const expressionStatement of expressionStatements) {
    if (expressionStatement.type && expressionStatement.type === 'ExpressionStatement') {
      const callExpression = (expressionStatement.expression as CallExpression);
      if (callExpression.type === 'CallExpression') {
        const callee = (callExpression.callee as MemberExpression);
        const calleeObject = (callee.object as Identifier);
        const calleeProperty = (callee.property as Identifier);
        if (calleeObject && calleeProperty &&
          calleeObject.name && calleeProperty.name &&
          calleeObject.name === 'Object' && calleeProperty.name === 'defineProperty') {
          const expressionArguments = callExpression.arguments;
          if (expressionArguments.length > 1 &&
            expressionArguments[0].type === 'ThisExpression' && expressionArguments[1].type === 'StringLiteral') {
            classProperties.push(expressionArguments[1].value);
          }
        }
      }
    }
  }

  return classProperties;
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

  const ast = parse(code);

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

export const cloneClassInstance = <T>(instance): T => {
  if (typeof instance !== 'object') {
    return instance;
  }
  return Object.assign( Object.create( Object.getPrototypeOf(instance)), instance);
};

export const isSameConstructor = (ctorOrCtorName, ctor2): boolean =>
  (typeof ctorOrCtorName === 'string' && ctorOrCtorName === ctor2.name) || ctorOrCtorName === ctor2;

export const isExtensionOf = (ctor, ctorExtensionOf): boolean => {
  if (typeof ctor === 'string') {
    let parent = Object.getPrototypeOf(ctorExtensionOf);
    while (parent.name) {
      if (parent.name === ctor) {return true; }
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

export const getMetadata = <T extends JsonAnnotationOptions>(metadataKey: string,
  target: Record<string, any>,
  propertyKey?: string | symbol | null,
  annotationsEnabled?: { [key: string]: any }): T => {
  const option: JsonAnnotationOptions = (propertyKey) ?
    Reflect.getMetadata(metadataKey, target, propertyKey) : Reflect.getMetadata(metadataKey, target);

  if (option != null && annotationsEnabled != null) {
    const annotationKeys = Object.keys(annotationsEnabled);
    const annotationKey = annotationKeys.find((key) => metadataKey.startsWith('jackson:' + key));
    if (annotationKey && typeof annotationsEnabled[annotationKey] === 'boolean') {
      option.enabled = annotationsEnabled[annotationKey];
    }
  }

  return option != null && option.enabled ? option as T : null;
};

export const hasMetadata = <T extends JsonAnnotationOptions>(metadataKey: string,
  target: Record<string, any>,
  propertyKey?: string | symbol | null,
  annotationsEnabled?: { [key: string]: any }): boolean => {
  const option: JsonAnnotationOptions = getMetadata<T>(metadataKey, target, propertyKey, annotationsEnabled);
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
