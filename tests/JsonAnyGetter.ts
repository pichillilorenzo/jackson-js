import test from 'ava';
import {JacksonError} from '../src/core/JacksonError';
import {JsonAnyGetter} from '../src/decorators/JsonAnyGetter';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JsonProperty} from '../src/decorators/JsonProperty';

test('@JsonAnyGetter', t => {
  class ScreenInfo {
    @JsonProperty()
    id: string;
    @JsonProperty()
    title: string;
    @JsonProperty()
    width: number;
    @JsonProperty()
    height: number;
    @JsonProperty()
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
    @JsonProperty()
    id: string;
    @JsonProperty()
    title: string;
    @JsonProperty()
    width: number;
    @JsonProperty()
    height: number;
    @JsonProperty()
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

test('Fail multi @JsonAnyGetter annotations', t => {

  const err = t.throws<JacksonError>(() => {
    class ScreenInfoWithMultiJsonAnyGetter {
      @JsonProperty()
      id: string;
      @JsonProperty()
      title: string;
      @JsonProperty()
      width: number;
      @JsonProperty()
      height: number;
      @JsonProperty()
      otherInfo: Map<string, any> = new Map<string, any>();

      @JsonAnyGetter()
      public getOtherInfo() {
        return this.otherInfo;
      }

      @JsonAnyGetter()
      public getSomeOtherInfo() {
        return this.otherInfo;
      }
    }
  });

  t.assert(err instanceof JacksonError);
});
