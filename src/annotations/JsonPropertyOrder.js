import {makeDecorator, isClass} from '../util';
import "reflect-metadata";

export function JsonPropertyOrder(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    alphabetic: false,
    value: []
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (!descriptor && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonPropertyOrder", options, target);
      return target;
    }
    return descriptor;
  })
}
