import {makeDecorator} from '../util';
import "reflect-metadata";

export function JsonIgnore(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    value: true
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (propertyKey && options.value)
      Reflect.defineMetadata("jackson:JsonIgnore", null, target.constructor, propertyKey);
    return descriptor;
  })
}
