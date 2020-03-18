import 'reflect-metadata';
import { JsonManagedReferenceOptions } from '../@types';
export interface JsonManagedReferencePrivateOptions extends JsonManagedReferenceOptions {
    propertyKey: string;
}
export declare type JsonManagedReferenceDecorator = (options?: JsonManagedReferenceOptions) => any;
export declare const JsonManagedReference: JsonManagedReferenceDecorator;
