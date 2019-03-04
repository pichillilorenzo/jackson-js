import {makeDecorator} from '../util';
import "reflect-metadata";

export function JsonSerialize(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    using: null
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (propertyKey && options.using)
      Reflect.defineMetadata("jackson:JsonSerialize", options.using, target, propertyKey);
    return descriptor;
  })
}
