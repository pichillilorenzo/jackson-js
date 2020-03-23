import 'reflect-metadata';
import { JsonFilterDecorator } from '../@types';
export declare enum JsonFilterType {
    SERIALIZE_ALL = 0,
    SERIALIZE_ALL_EXCEPT = 1,
    FILTER_OUT_ALL_EXCEPT = 2
}
export declare const JsonFilter: JsonFilterDecorator;
