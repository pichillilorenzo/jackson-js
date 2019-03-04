import {makeDecorator} from '../util';
import "reflect-metadata";

export function JsonValue(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    value: true
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (descriptor && typeof descriptor.value === "function" && options.value)
      Reflect.defineMetadata("jackson:JsonValue", propertyKey, target);
    return descriptor;
  })
}
