import {makeDecorator, isClass} from '../util';
import "reflect-metadata";

export function JsonCreator(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    properties: null
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    options.constructor = null;
    options.method = null;
    if (descriptor && typeof descriptor.value === "function") {
      options.method = descriptor.value;
      Reflect.defineMetadata("jackson:JsonCreator", options, target);
    }
    else if (!descriptor && isClass(target)) {
      options.constructor = target;
      // get original constructor
      while(options.constructor.toString().trim().startsWith("class extends target {"))
        options.constructor = Object.getPrototypeOf(options.constructor)
  
      Reflect.defineMetadata("jackson:JsonCreator", options, target);
      return target;
    }
    return descriptor;
  })
}
