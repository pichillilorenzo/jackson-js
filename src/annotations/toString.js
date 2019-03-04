import "reflect-metadata";
import { isClass, findGetter } from "../util";

export function ToString(options) {

  // set default values on missing attributes
  options = Object.assign({
    onlyExplicitlyIncluded: false,
    includeFieldNames: true,
    doNotUseGetters: false,
    callSuper: ToString.callSuper.SKIP
  }, options);

  return function decorator(target, propertyKey, descriptor) {
    if (!descriptor && isClass(target)) {
      //console.log(target.prototype.toString.toString())
      // if (target.prototype.toString && target.prototype.toString.toString() !== "function toString() { [native code] }") {
      //   console.log(target)
      //   return target;
      // }
      console.log("aasdasdasd")
      target.prototype.toString = function() {
        let toString = target.name + "(";
        let attributeToString = [];
        let superClass = Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(Object.getPrototypeOf(this)))))
        // console.log(superClass)
        // if (options.callSuper == ToString.callSuper.CALL && superClass && superClass.prototype.toString) {
        //   attributeToString.push({
        //     attribute: (options.includeFieldNames ? "super=" : "") + superClass.prototype.toString.call(this),
        //     rank: 0
        //   });
        // }

        for (const key of Object.keys(this)) {
          if (typeof this[key] === "function")
            continue;
            
          let exclude = Reflect.hasMetadata("lombok:ToString:Exclude", this, key);
          let include = Reflect.getMetadata("lombok:ToString:Include", this, key);

          if (!exclude || (options.onlyExplicitlyIncluded && include)) {
            let getter = null;
            if (!options.doNotUseGetters) {
              getter = findGetter(this, key);
            }
            // if getter doesn't exist, use the key
            let value = (getter && this[getter]) ? this[getter]() : this[key];
            value = (value) ? value.toString.call(value) : value;
            
            
            let fieldName = ""

            if (options.includeFieldNames) {
              fieldName = (include && include.name) ? include.name : key;
              fieldName += "=";
            }

            attributeToString.push( {
              attribute: fieldName + value,
              rank: (include && include.rank) ? include.rank : 0
            } );
          }

        }

        // sort by rank DESC
        attributeToString = attributeToString.sort((a,b) => {return a.rank - b.rank})
        toString += attributeToString.map((item) => {return item.attribute}).join(", ");
        toString += ")";

        return toString;
      };
        
      return target;
    }
    return descriptor;
  };
}

Object.defineProperty(ToString, "Include", {
  writable: true,
  enumerable: true,
  configurable: true,
  value: function(options) {

    // set default values on missing attributes
    options = Object.assign({
      name: null,
      rank: 0
    }, options);

    return function decorator(target, propertyKey, descriptor) {
      if (propertyKey)
        Reflect.defineMetadata("lombok:ToString:Include", options, target, propertyKey);
      return descriptor;
    };
  }
});

Object.defineProperty(ToString, "Exclude", {
  enumerable: true,
  configurable: true,
  get: function() {
    return function decorator(target, propertyKey, descriptor) {
      if (propertyKey)
        Reflect.defineMetadata("lombok:ToString:Exclude", true, target, propertyKey);
      return descriptor;
    };
  }
});

Object.defineProperty(ToString, "callSuper", {
  writable: true,
  enumerable: true,
  configurable: true,
  value: {
    CALL: "call",
    SKIP: "skip"
  }
});