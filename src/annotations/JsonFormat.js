import {makeDecorator} from '../util';
import "reflect-metadata";

export function JsonFormat(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    shape: 0,
    pattern: null,
    locale: "en-US",
    timezone: {}
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (propertyKey)
      Reflect.defineMetadata("jackson:JsonFormat", options, target, propertyKey);
    return descriptor;
  })
}

Object.defineProperty(JsonFormat, "Shape", {
  writable: true,
  enumerable: true,
  configurable: true,
  value: {
    ANY: 0,
    ARRAY: 1,
    BOOLEAN: 2,
    NUMBER_FLOAT: 3,
    NUMBER_INT: 4,
    OBJECT: 5,
    SCALAR: 6,
    STRING: 7
  }
});