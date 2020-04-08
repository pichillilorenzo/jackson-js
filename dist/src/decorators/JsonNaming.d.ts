/**
 * @packageDocumentation
 * @module Decorators
 */
import 'reflect-metadata';
import { JsonNamingDecorator } from '../@types';
export declare enum JsonNamingStrategy {
    SNAKE_CASE = 0,
    UPPER_CAMEL_CASE = 1,
    LOWER_CAMEL_CASE = 2,
    LOWER_CASE = 3,
    KEBAB_CASE = 4,
    LOWER_DOT_CASE = 5
}
export declare const JsonNaming: JsonNamingDecorator;
