import { parse } from "@babel/parser";

/**
 * https://stackoverflow.com/a/43197340/4637638
 */
export function isClass(obj) {
  const isCtorClass = obj.constructor
      && obj.constructor.toString().substring(0, 5) === 'class'
  if(obj.prototype === undefined) {
    return isCtorClass
  }
  const isPrototypeCtorClass = obj.prototype.constructor 
    && obj.prototype.constructor.toString
    && obj.prototype.constructor.toString().substring(0, 5) === 'class'
  return isCtorClass || isPrototypeCtorClass
}

export function makeDecorator(defaultOptions, optionsOrTarget, propertyKey, descriptor, decorator){
  if (typeof optionsOrTarget === "function" || propertyKey != null || descriptor != null) {
    const target = optionsOrTarget;
    return decorator(defaultOptions, target, propertyKey, descriptor);
  }
  else {
    let options = optionsOrTarget;
    options = Object.assign(defaultOptions, options);
    return function (target, propertyKey, descriptor) {
      return decorator(options, target, propertyKey, descriptor);
    }
  }
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
    ].concat((useFlow) ? ["flowComments"] : [])
  });

  let { body } = ast.program;
  if (code.startsWith("class ")) {
    body = body[0].body.body;
    // find constructor
    for (let propertyOrMethod of body) {
      if (propertyOrMethod.kind === "constructor") {
        body = [propertyOrMethod];
        break;
      }
    }
  }

  return body.reduce((args, exp) => {
    if (exp.params) return args.concat(exp.params)
    if (exp.expression.params) return args.concat(exp.expression.params)
    return args;
  }, []).map(pluckParamName);
}

export function closeClassInstance(instance) {
  return Object.assign( Object.create( Object.getPrototypeOf(instance)), instance);
}