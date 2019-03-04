import {makeDecorator} from '../util';
import "reflect-metadata";

export function JsonManagedReference(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    value: null
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (descriptor && options.value != null) {
      Reflect.defineMetadata("jackson:JsonManagedReference", options.value, target.constructor, propertyKey);
      Reflect.defineMetadata("jackson:JsonManagedReference:"+propertyKey, options.value, target.constructor);
    }
    return descriptor;
  })
}
