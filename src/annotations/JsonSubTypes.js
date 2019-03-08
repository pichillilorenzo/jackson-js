import {makeDecorator, isClass} from '../util';
import "reflect-metadata";

export function JsonSubTypes(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    value: null,
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (options.value && options.value.length > 0 && !descriptor && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonSubTypes", options.value, target);
      return target;
    }
    return descriptor;
  })
}