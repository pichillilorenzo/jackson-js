import 'reflect-metadata';
import { JsonIncludeDecorator } from '../@types';
export declare enum JsonIncludeType {
    ALWAYS = 0,
    NON_EMPTY = 1,
    NON_NULL = 2
}
export declare const JsonInclude: JsonIncludeDecorator;
