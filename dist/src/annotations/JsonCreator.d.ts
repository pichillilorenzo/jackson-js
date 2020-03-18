import 'reflect-metadata';
import { JsonCreatorOptions } from '../@types';
export interface JsonCreatorPrivateOptions extends JsonCreatorOptions {
    constructor?: Record<string, any> | ObjectConstructor;
    method?: Function;
}
export declare type JsonCreatorDecorator = (options?: JsonCreatorOptions) => any;
export declare const JsonCreator: JsonCreatorDecorator;
