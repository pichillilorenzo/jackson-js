import 'reflect-metadata';
import { JsonIncludeOptions } from '../@types';
export declare enum JsonIncludeType {
    ALWAYS = 0,
    NON_EMPTY = 1,
    NON_NULL = 2
}
export declare type JsonIncludeDecorator = (options?: JsonIncludeOptions) => any;
export declare const JsonInclude: JsonIncludeDecorator;
