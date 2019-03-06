import {makeDecorator} from '../util';
import "reflect-metadata";

export function JsonAnySetter(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    enabled: true
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (propertyKey && options.enabled)
      Reflect.defineMetadata("jackson:JsonAnySetter", propertyKey, target);
    return descriptor;
  })
}
