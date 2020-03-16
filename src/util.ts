import {parse, ParserPlugin} from '@babel/parser';
import {
  ClassDeclaration,
  ClassMethod,
  ExpressionStatement,
  FunctionExpression,
  Node
} from '@babel/types';
import {ClassType, JsonAnnotationDecorator, JsonAnnotationOptions} from './@types';

/**
 * https://stackoverflow.com/a/43197340/4637638
 */
export const isClass = (obj): boolean => {
  const isCtorClass = obj.constructor
      && obj.constructor.toString().substring(0, 5) === 'class';
  // eslint-disable-next-line id-blacklist
  if (obj.prototype === undefined) {
    return isCtorClass;
  }
  const isPrototypeCtorClass = obj.prototype.constructor
    && obj.prototype.constructor.toString
    && obj.prototype.constructor.toString().substring(0, 5) === 'class';
  return isCtorClass || isPrototypeCtorClass;
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
    if (o.enabled) {
      const value = decorator(o, target, propertyKey, descriptorOrParamIndex);
      if (value != null) {
        return value;
      }
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

export const getArgumentNames = (method, useFlow = false): string[] => {
  let code = method.toString().trim();

  if (code.endsWith(' { [native code] }')) {
    return [];
  }

  if (code.startsWith('class extends')) {
    code = 'class JacksonClass ' + code.substring(6);
  } else if (!code.startsWith('class ') && !code.startsWith('function ')) {
    code = 'function ' + code;
  }

  const ast = parse(code, {
    plugins: [
      'jsx',
      (!useFlow) ? 'typescript' : 'flow'
    ].concat((useFlow) ? ['flowComments'] : []) as ParserPlugin[]
  });

  const { body } = ast.program;
  let nodes: Node[] = [];
  if (code.startsWith('class ')) {
    nodes = (body[0] as ClassDeclaration).body.body;
    // find constructor
    for (const propertyOrMethod of nodes) {
      if ((propertyOrMethod as ClassMethod).kind === 'constructor') {
        nodes = [propertyOrMethod];
        break;
      }
    }
  }

  return nodes.reduce((args, exp) => {
    if ((exp as ClassMethod).params) {
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
  isSameConstructor(ctorOrCtorName, ctor2) || isExtensionOf(ctorOrCtorName, ctor2);

export const hasIterationProtocol = (variable): boolean =>
  variable !== null && Symbol.iterator in Object(variable);

export const isIterableNoString = (variable): boolean =>
  typeof variable !== 'string' && hasIterationProtocol(variable);

export const isClassIterable = (ctor: ClassType<any>): boolean =>
  hasIterationProtocol(ctor.prototype);
