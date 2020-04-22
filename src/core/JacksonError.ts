/**
 * @packageDocumentation
 * @module Core
 */

/**
 * Exception used to signal fatal problems during JSON serialization/deserialization.
 */
export class JacksonError extends Error {
  constructor(message) {
    super(message);

    /**
     * https://medium.com/@xpl/javascript-deriving-from-error-properly-8d2f8f315801
     */
    this.constructor = JacksonError;
    // @ts-ignore
    this.__proto__   = JacksonError.prototype;
    this.message     = message;
  }
}
