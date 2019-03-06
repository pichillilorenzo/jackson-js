import {makeDecorator, isClass} from '../util';
import "reflect-metadata";

export function JsonIgnoreProperties(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    value: null,
    allowGetters: false,
    allowSetters: false
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (!descriptor && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonIgnoreProperties", options, target);
      return target;
    }
    return descriptor;
  })
}
