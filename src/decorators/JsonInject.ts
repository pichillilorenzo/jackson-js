/**
 * @packageDocumentation
 * @module Decorators
 */

import {defineMetadata, getArgumentNames, makeJacksonDecorator} from '../util';
import {JsonInjectDecorator, JsonInjectOptions} from '../@types';
import {JacksonError} from '../core/JacksonError';

/**
 * Decorator used for indicating that value of decorated property will be "injected" through
 * {@link JsonParserContext.injectableValues} value configured by {@link ObjectMapper}.
 *
 * @example
 * ```typescript
 * class CurrencyRate {
 *   @JsonProperty() @JsonClassType({type: () => [String]})
 *   pair: string;
 *   @JsonProperty() @JsonClassType({type: () => [Number]})
 *   rate: number;
 *
 *   @JsonInject()
 *   @JsonProperty()
 *   @JsonClassType({type: () => [Date]})
 *   lastUpdated: Date;
 * }
 *
 * const objectMapper = new ObjectMapper();
 * const jsonData = '{"pair":"USD/JPY","rate":109.15}';
 * const now = new Date();
 *
 * const currencyRate = objectMapper.parse<CurrencyRate>(jsonData, {
 *   mainCreator: () => [CurrencyRate],
 *   injectableValues: {
 *     lastUpdated: now
 *   }
 * });
 * ```
 */
export const JsonInject: JsonInjectDecorator = makeJacksonDecorator(
  (o: JsonInjectOptions = {}): JsonInjectOptions => ({
    enabled: true,
    useInput: true,
    ...o
  }),
  (options: JsonInjectOptions, target, propertyKey, descriptorOrParamIndex) => {
    if (!options.value && propertyKey != null) {
      options.value = propertyKey.toString();
    }

    if (descriptorOrParamIndex != null && typeof descriptorOrParamIndex === 'number') {
      if (!options.value || (propertyKey != null && options.value === propertyKey.toString())) {
        const method = (propertyKey) ? target[propertyKey.toString()] : target;
        const argNames = getArgumentNames(method);
        options.value = argNames[descriptorOrParamIndex];
      }

      defineMetadata('JsonInjectParam',
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor', {
          suffix: descriptorOrParamIndex.toString()
        });
    }

    if (propertyKey != null) {
      if (descriptorOrParamIndex != null && typeof (descriptorOrParamIndex as TypedPropertyDescriptor<any>).value === 'function') {
        const methodName = propertyKey.toString();
        if (methodName.startsWith('get') || methodName.startsWith('set')) {
          options.value = methodName.substring(3);
          if (options.value.length > 0) {
            options.value = options.value.charAt(0).toLowerCase() + options.value.substring(1);
          }
        }
        if (!options.value) {
          // eslint-disable-next-line max-len
          throw new JacksonError(`Invalid usage of @JsonInject() on ${((target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor).name}.${propertyKey.toString()}. You must either define a non-empty @JsonInject() option value or change the method name starting with "get" for Getters or "set" for Setters.`);
        }
      }
      defineMetadata('JsonInject', options, target.constructor, propertyKey);
    }
  });
