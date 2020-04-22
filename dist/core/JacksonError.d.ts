/**
 * @packageDocumentation
 * @module Core
 */
/**
 * Exception used to signal fatal problems during JSON serialization/deserialization.
 */
export declare class JacksonError extends Error {
    constructor(message: any);
}
