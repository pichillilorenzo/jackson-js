import 'reflect-metadata';
import { JsonBackReferenceOptions } from '../@types';
export interface JsonBackReferencePrivateOptions extends JsonBackReferenceOptions {
    propertyKey: string;
}
export declare type JsonBackReferenceDecorator = (options?: JsonBackReferenceOptions) => any;
export declare const JsonBackReference: JsonBackReferenceDecorator;
