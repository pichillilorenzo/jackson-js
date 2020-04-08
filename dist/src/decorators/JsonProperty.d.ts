/**
 * @packageDocumentation
 * @module Decorators
 */
import 'reflect-metadata';
import { JsonPropertyDecorator } from '../@types';
export declare enum JsonPropertyAccess {
    WRITE_ONLY = 0,
    READ_ONLY = 1,
    READ_WRITE = 2,
    AUTO = 3
}
export declare const JsonProperty: JsonPropertyDecorator;
