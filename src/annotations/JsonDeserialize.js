import {makeDecorator} from '../util';
import "reflect-metadata";

export function JsonDeserialize(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    using: null
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (propertyKey && options.using)
      Reflect.defineMetadata("jackson:JsonDeserialize", options.using, target.constructor, propertyKey);
    return descriptor;
  })
}
