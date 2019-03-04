import {makeDecorator} from '../util';
import "reflect-metadata";

export function JsonRawValue(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    value: true
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (propertyKey && options.value)
      Reflect.defineMetadata("jackson:JsonRawValue", null, target, propertyKey);
    return descriptor;
  })
}
