import 'reflect-metadata';
import { JsonAnySetterOptions } from '../@types';
export interface JsonAnySetterPrivateOptions extends JsonAnySetterOptions {
    propertyKey: string;
}
export declare type JsonAnySetterDecorator = (options?: JsonAnySetterOptions) => any;
export declare const JsonAnySetter: JsonAnySetterDecorator;
