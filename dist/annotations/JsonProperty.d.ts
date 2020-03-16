import 'reflect-metadata';
import { JsonPropertyOptions } from '../@types';
export declare enum JsonPropertyAccess {
    WRITE_ONLY = 0,
    READ_ONLY = 1,
    READ_WRITE = 2,
    AUTO = 3
}
export declare type JsonPropertyDecorator = (options?: JsonPropertyOptions) => any;
export declare const JsonProperty: JsonPropertyDecorator;
