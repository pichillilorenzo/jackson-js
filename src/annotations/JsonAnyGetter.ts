import {makeJacksonDecorator} from '../util';
import "reflect-metadata";
import {JsonAnyGetterOptions} from "../@types";

export interface JsonAnyGetterDecorator {
  (options?: JsonAnyGetterOptions): any;
}

export const JsonAnyGetter: JsonAnyGetterDecorator = makeJacksonDecorator(
  (o: JsonAnyGetterOptions): JsonAnyGetterOptions => ({enabled: true, ...o}),
  (options: JsonAnyGetterOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (propertyKey) {
      Reflect.defineMetadata("jackson:JsonAnyGetter", propertyKey, target);
    }
  });
