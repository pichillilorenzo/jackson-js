import 'reflect-metadata';
import { JsonIdentityInfoDecorator } from '../@types';
export declare enum ObjectIdGenerator {
    IntSequenceGenerator = 0,
    None = 1,
    PropertyGenerator = 2,
    UUIDv5Generator = 3,
    UUIDv4Generator = 4,
    UUIDv3Generator = 5,
    UUIDv1Generator = 6
}
export declare const JsonIdentityInfo: JsonIdentityInfoDecorator;
