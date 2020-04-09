/**
 * @packageDocumentation
 * @module Decorators
 */
import 'reflect-metadata';
import { JsonInjectDecorator } from '../@types';
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
export declare const JsonInject: JsonInjectDecorator;
