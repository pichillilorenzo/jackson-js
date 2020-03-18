import 'reflect-metadata';
import { JsonFormatOptions } from '../@types';
export declare enum JsonFormatShape {
    ANY = 0,
    ARRAY = 1,
    BOOLEAN = 2,
    NUMBER_FLOAT = 3,
    NUMBER_INT = 4,
    OBJECT = 5,
    SCALAR = 6,
    STRING = 7
}
export declare type JsonFormatDecorator = (options?: JsonFormatOptions) => any;
export declare const JsonFormat: JsonFormatDecorator;
