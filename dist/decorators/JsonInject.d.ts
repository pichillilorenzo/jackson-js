/**
 * @packageDocumentation
 * @module Decorators
 */
import { JsonInjectDecorator } from '../@types';
/**
 * Decorator used for indicating that value of decorated property will be "injected" through
 * {@link JsonParserContext.injectableValues} value.
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
export declare const JsonInject: JsonInjectDecorator;
