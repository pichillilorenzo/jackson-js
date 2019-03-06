import {makeDecorator} from '../util';
import "reflect-metadata";

export function JsonAnyGetter(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    enabled: true
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (propertyKey && options.enabled)
      Reflect.defineMetadata("jackson:JsonAnyGetter", propertyKey, target);
    return descriptor;
  })
}
