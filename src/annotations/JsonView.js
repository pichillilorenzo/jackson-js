import {makeDecorator} from '../util';
import "reflect-metadata";

export function JsonView(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    value: null
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (propertyKey && options.value)
      Reflect.defineMetadata("jackson:JsonView", options.value, target.constructor, propertyKey);
    return descriptor;
  })
}
