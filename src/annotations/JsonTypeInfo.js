import {makeDecorator, isClass} from '../util';
import "reflect-metadata";

export function JsonTypeInfo(optionsOrTarget, propertyKey, descriptor) {
  return makeDecorator({ 
    use: 0,
    include: 0,
    property: '@type'
  }, optionsOrTarget, propertyKey, descriptor, 
  (options, target, propertyKey, descriptor) => {
    if (!descriptor && isClass(target)) {
      Reflect.defineMetadata("jackson:JsonTypeInfo", options, target);
      return target;
    }
    return descriptor;
  })
}

Object.defineProperty(JsonTypeInfo, "Id", {
  writable: true,
  enumerable: true,
  configurable: true,
  value: {
    CLASS: 0,
    NAME: 1,
  }
});

Object.defineProperty(JsonTypeInfo, "As", {
  writable: true,
  enumerable: true,
  configurable: true,
  value: {
    PROPERTY: 0,
    WRAPPER_OBJECT: 1,
    WRAPPER_ARRAY: 2,
    EXTERNAL_PROPERTY: 3
  }
});