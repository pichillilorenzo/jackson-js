import 'reflect-metadata';
import { JsonFilterOptions } from '../@types';
export declare enum JsonFilterType {
    SERIALIZE_ALL = 0,
    SERIALIZE_ALL_EXCEPT = 1,
    FILTER_OUT_ALL_EXCEPT = 2
}
export declare type JsonFilterDecorator = (options: JsonFilterOptions) => any;
export declare const JsonFilter: JsonFilterDecorator;
