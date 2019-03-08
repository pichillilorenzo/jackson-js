import {makeDecorator, isClass} from '../util';
import "reflect-metadata";

export function JsonTypeName(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    value: ''
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (options.value && options.value.trim() !== "" && !descriptor && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonTypeName", options.value, target);
      return target;
    }
    return descriptor;
  })
}