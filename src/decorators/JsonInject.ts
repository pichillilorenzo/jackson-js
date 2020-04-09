/**
 * @packageDocumentation
 * @module Decorators
 */

import {getArgumentNames, makeJacksonDecorator} from '../util';
import 'reflect-metadata';
import {JsonInjectDecorator, JsonInjectOptions} from '../@types';

/**
 * Decorator used for indicating that value of decorated property will be "injected" through
 * {@link JsonParserContext.injectableValues} value configured by {@link ObjectMapper}.
 *
 * @example
 * ```typescript
 * class CurrencyRate {
 *   @JsonProperty()
 *   pair: string;
 *   @JsonProperty()
 *   rate: number;
 *
 *   @JsonInject()
 *   @JsonProperty()
 *   @JsonClass({class: () => [Date]})
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

      Reflect.defineMetadata('jackson:JsonInjectParam:' + descriptorOrParamIndex.toString(),
        options, (target.constructor.toString().endsWith('{ [native code] }')) ? target : target.constructor,
        (propertyKey) ? propertyKey : 'constructor');
    }

    if (propertyKey != null) {
      Reflect.defineMetadata('jackson:JsonInject', options, target.constructor, propertyKey);
    }
  });
