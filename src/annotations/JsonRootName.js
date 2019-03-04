import {makeDecorator, isClass} from '../util';
import "reflect-metadata";

export function JsonRootName(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    value: null,
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (!descriptor && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonRootName", options.value || target.name, target);
      return target;
    }
    return descriptor;
  })
}
