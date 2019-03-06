import {makeDecorator, isClass} from '../util';
import "reflect-metadata";

export function JsonIgnoreType(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    value: true,
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (options.value && !descriptor && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonIgnoreType", null, target);
      return target;
    }
    return descriptor;
  })
}
