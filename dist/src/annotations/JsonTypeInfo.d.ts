import 'reflect-metadata';
import { JsonTypeInfoOptions } from '../@types';
export declare enum JsonTypeInfoId {
    NAME = 0
}
export declare enum JsonTypeInfoAs {
    PROPERTY = 0,
    WRAPPER_OBJECT = 1,
    WRAPPER_ARRAY = 2
}
export declare type JsonTypeInfoDecorator = (options: JsonTypeInfoOptions) => any;
export declare const JsonTypeInfo: JsonTypeInfoDecorator;
