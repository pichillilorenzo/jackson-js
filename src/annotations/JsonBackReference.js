import {makeDecorator} from '../util';
import "reflect-metadata";

export function JsonBackReference(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    value: null
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (descriptor && options.value != null) {
      Reflect.defineMetadata("jackson:JsonBackReference", options.value, target.constructor, propertyKey);
      Reflect.defineMetadata("jackson:JsonBackReference:"+propertyKey, options.value, target.constructor);
    }
    return descriptor;
  })
}
