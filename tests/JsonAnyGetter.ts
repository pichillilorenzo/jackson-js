import test from 'ava';
import {JacksonError} from '../src/core/JacksonError';
import {JsonAnyGetter} from '../src/decorators/JsonAnyGetter';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';
import {JsonClassType} from '../src/decorators/JsonClassType';

test('@JsonAnyGetter', t => {
  class ScreenInfo {
    @JsonProperty() @JsonClassType({type: () => [String]})
    id: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    title: string;
    @JsonProperty() @JsonClassType({type: () => [Number]})
    width: number;
    @JsonProperty() @JsonClassType({type: () => [Number]})
    height: number;
    @JsonProperty() @JsonClassType({type: () => [Map, [String, Object]]})
    otherInfo: Map<string, any> = new Map<string, any>();

    @JsonAnyGetter()
    public getOtherInfo(): Map<string, any> {
      return this.otherInfo;
    }
  }

  const objectMapper = new ObjectMapper();

  const screenInfo = new ScreenInfo();
  screenInfo.id = 'TradeDetails';
  screenInfo.title = 'Trade Details';
  screenInfo.width = 500;
  screenInfo.height = 300;
  screenInfo.otherInfo.set('xLocation', 400);
  screenInfo.otherInfo.set('yLocation', 200);

  const jsonData = objectMapper.stringify<ScreenInfo>(screenInfo);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":"TradeDetails","title":"Trade Details","width":500,"height":300,"xLocation":400,"yLocation":200}'));
});

test('@JsonAnyGetter with value', t => {
  class ScreenInfo {
    @JsonProperty() @JsonClassType({type: () => [String]})
    id: string;
    @JsonProperty() @JsonClassType({type: () => [String]})
    title: string;
    @JsonProperty() @JsonClassType({type: () => [Number]})
    width: number;
    @JsonProperty() @JsonClassType({type: () => [Number]})
    height: number;
    @JsonProperty() @JsonClassType({type: () => [Map, [String, Object]]})
    otherInfo: Map<string, any> = new Map<string, any>();

    @JsonAnyGetter({value: 'otherInfo'})
    public getCustomInfo(): Map<string, any> {
      return this.otherInfo;
    }
  }

  const objectMapper = new ObjectMapper();

  const screenInfo = new ScreenInfo();
  screenInfo.id = 'TradeDetails';
  screenInfo.title = 'Trade Details';
  screenInfo.width = 500;
  screenInfo.height = 300;
  screenInfo.otherInfo.set('xLocation', 400);
  screenInfo.otherInfo.set('yLocation', 200);

  const jsonData = objectMapper.stringify<ScreenInfo>(screenInfo);
  // eslint-disable-next-line max-len
  t.deepEqual(JSON.parse(jsonData), JSON.parse('{"id":"TradeDetails","title":"Trade Details","width":500,"height":300,"xLocation":400,"yLocation":200}'));
});

test('Fail multi @JsonAnyGetter decorators', t => {

  const err = t.throws<JacksonError>(() => {
    class ScreenInfoWithMultiJsonAnyGetter {
      @JsonProperty() @JsonClassType({type: () => [String]})
      id: string;
      @JsonProperty() @JsonClassType({type: () => [String]})
      title: string;
      @JsonProperty() @JsonClassType({type: () => [Number]})
      width: number;
      @JsonProperty() @JsonClassType({type: () => [Number]})
      height: number;
      @JsonProperty() @JsonClassType({type: () => [Map, [String, Object]]})
      otherInfo: Map<string, any> = new Map<string, any>();

      @JsonAnyGetter() @JsonClassType({type: () => [Map, [String, Object]]})
      public getOtherInfo(): Map<string, any> {
        return this.otherInfo;
      }

      @JsonAnyGetter() @JsonClassType({type: () => [Map, [String, Object]]})
      public getSomeOtherInfo(): Map<string, any> {
        return this.otherInfo;
      }
    }
  });

  t.assert(err instanceof JacksonError);
});
