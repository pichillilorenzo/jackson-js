import {parse, ParserPlugin} from "@babel/parser";
import {JsonAnnotationDecorator, JsonAnnotationOptions} from "./@types";

/**
 * https://stackoverflow.com/a/43197340/4637638
 */
export function isClass(obj): boolean {
  const isCtorClass = obj.constructor
      && obj.constructor.toString().substring(0, 5) === 'class';
  if(obj.prototype === undefined) {
    return isCtorClass
  }
  const isPrototypeCtorClass = obj.prototype.constructor 
    && obj.prototype.constructor.toString
    && obj.prototype.constructor.toString().substring(0, 5) === 'class';
  return isCtorClass || isPrototypeCtorClass
}

export function makeDecorator<T>(
  options: (...args: any[]) => JsonAnnotationOptions,
  decorator: JsonAnnotationDecorator): any {
  function DecoratorFactory(...args: any[]) {
    const target: Object = args[0];
    const propertyKey: null | string | symbol = args[1];
    const descriptorOrParamIndex: null | number | TypedPropertyDescriptor<any> = args[2];
    if ((typeof target === "function" || propertyKey != null || descriptorOrParamIndex != null) ||
      descriptorOrParamIndex != null && typeof descriptorOrParamIndex === "number") {
      return decorator(options(), target, propertyKey, descriptorOrParamIndex);
    } else {
      return function <T>(target: Object, propertyKey?: string | symbol, descriptor?: TypedPropertyDescriptor<T>) {
        return decorator(options(args[0]), target, propertyKey, descriptor);
      }
    }
  }
  return DecoratorFactory;
}

/** 
 * https://github.com/rphansen91/es-arguments/blob/master/src/arguments.js#L3
*/
function pluckPattern (pattern) {
  return ['{',
    pattern.map(({ key }) => key.name).join(', '),
  '}'].join(' ');
}

/** 
 * https://github.com/rphansen91/es-arguments/blob/master/src/arguments.js#L9
*/
function pluckParamName (param) {
  if (param.name) return param.name;
  if (param.left) return pluckParamName(param.left);
  if (param.properties) return pluckPattern(param.properties);
  if (param.type === 'RestElement') return '...' + pluckParamName(param.argument);
  return;
}

export function getArgumentNames(method, useFlow=false) {
  let code = method.toString().trim();

  if (code.startsWith("class extends"))
    code = "class JacksonClass " + code.substring(6);
  else if (!code.startsWith("class ") && !code.startsWith("function "))
    code = "function " + code;

  const ast = parse(code, {
    plugins: [
      "jsx",
      (!useFlow) ? "typescript" : "flow"
    ].concat((useFlow) ? ["flowComments"] : []) as ParserPlugin[]
  });

  let { body } = ast.program;
  if (code.startsWith("class ")) {
    // @ts-ignore
    body = body[0].body.body;
    // find constructor
    for (let propertyOrMethod of body) {
      // @ts-ignore
      if (propertyOrMethod.kind === "constructor") {
        body = [propertyOrMethod];
        break;
      }
    }
  }

  return body.reduce((args, exp) => {
    // @ts-ignore
    if (exp.params) return args.concat(exp.params)
    // @ts-ignore
    if (exp.expression.params) return args.concat(exp.expression.params)
    return args;
  }, []).map(pluckParamName);
}

export function cloneClassInstance(instance) {
  return Object.assign( Object.create( Object.getPrototypeOf(instance)), instance);
}

export function isSameConstructor(ctorOrCtorName, ctor2) {
  return (typeof ctorOrCtorName === "string" && ctorOrCtorName === ctor2.name) || ctorOrCtorName === ctor2;
}

export function isExtensionOf(ctor, ctorExtensionOf) {
  if (typeof ctor === "string") {
    let parent = Object.getPrototypeOf(ctorExtensionOf);
    while(parent.name) {
      if (parent.name === ctor)
        return true;
      parent = Object.getPrototypeOf(parent);
    }
  }
  else
    return ctor !== ctorExtensionOf && ctorExtensionOf.prototype instanceof ctor;
  return false;
}