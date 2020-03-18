import 'reflect-metadata';
import { JsonAnyGetterOptions } from '../@types';
export interface JsonAnyGetterPrivateOptions extends JsonAnyGetterOptions {
    propertyKey: string;
}
export declare type JsonAnyGetterDecorator = (options?: JsonAnyGetterOptions) => any;
export declare const JsonAnyGetter: JsonAnyGetterDecorator;
