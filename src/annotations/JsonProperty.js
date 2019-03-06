import {makeDecorator} from '../util';
import "reflect-metadata";

export function JsonProperty(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    value: null,
    defaultValue: null
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (descriptor) {
      options.defaultValue = (options.defaultValue) ? options.defaultValue : propertyKey;
      options.value = (options.value) ? options.value : options.defaultValue;
      Reflect.defineMetadata("jackson:JsonProperty", options, target, propertyKey);
      Reflect.defineMetadata("jackson:JsonProperty:"+propertyKey, options, target.constructor);
      Reflect.defineMetadata("jackson:JsonProperty:reverse:"+options.value, propertyKey, target.constructor);
    }
    return descriptor;
  })
}
