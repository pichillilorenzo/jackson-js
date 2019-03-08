import {makeDecorator, isClass} from '../util';
import "reflect-metadata";

export function JsonInclude(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    value: 0
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (options.value !== 0) {
      if (!descriptor && isClass(target)) {
        Reflect.defineMetadata("jackson:JsonInclude", options, target);
        return target;
      }
      else if (propertyKey)
        Reflect.defineMetadata("jackson:JsonInclude", options, target, propertyKey);
    }
    return descriptor;
  })
}

Object.defineProperty(JsonInclude, "Include", {
  writable: true,
  enumerable: true,
  configurable: true,
  value: {
    ALWAYS: 0,
    NON_EMPTY: 1,
    NON_NULL: 2,
  }
});