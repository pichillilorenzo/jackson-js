/**
 * @packageDocumentation
 * @module Decorators
 */
import 'reflect-metadata';
import { JsonTypeInfoDecorator } from '../@types';
export declare enum JsonTypeInfoId {
    NAME = 0
}
export declare enum JsonTypeInfoAs {
    PROPERTY = 0,
    WRAPPER_OBJECT = 1,
    WRAPPER_ARRAY = 2
}
export declare const JsonTypeInfo: JsonTypeInfoDecorator;
