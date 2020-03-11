import {JsonStringifier} from "../core/JsonStringifier";
import {JsonParserOptions, JsonStringifierOptions} from "../@types";
import {JsonParser} from "../core/JsonParser";

export class ObjectMapper {
  constructor() {

  }

  stringify<T>(obj: T, replacer?: (key: string, value: any) => any, format?: string, options?: JsonStringifierOptions): string {
    return JsonStringifier.stringify<T>(obj, replacer, format, options);
  }

  parse<T>(text: string, reviver?: (key: string, value: any) => any, options?: JsonParserOptions<T>): T {
    return JsonParser.parse<T>(text, reviver, options);
  }
}