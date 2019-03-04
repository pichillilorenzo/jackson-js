import {makeDecorator} from '../util';
import "reflect-metadata";

export function JsonProperty(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    value: null,
    defaultValue: null
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (descriptor) {
      let metadata = {
        type: typeof descriptor.value,
        value: (options.value) ? options.value : options.defaultValue
      };
      Reflect.defineMetadata("jackson:JsonProperty", metadata, target, propertyKey);
      Reflect.defineMetadata("jackson:JsonProperty:"+propertyKey, metadata, target.constructor);
    }
    return descriptor;
  })
}
