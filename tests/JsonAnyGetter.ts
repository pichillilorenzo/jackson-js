import test from 'ava';
import {JsonAnyGetter} from '../src/annotations/JsonAnyGetter';
import {ObjectMapper} from '../src/databind/ObjectMapper';
import {JacksonError} from "../src/core/JacksonError";

class ScreenInfo {
  id: string;
  title: string;
  width: number;
  height: number;
  otherInfo: Map<string, any> = new Map<string, any>();

  @JsonAnyGetter({for: 'otherInfo'})
  public getOtherInfo() {
    return this.otherInfo;
  }
}

test('@JsonAnyGetter', t => {
  const objectMapper = new ObjectMapper();

  const screenInfo = new ScreenInfo();
  screenInfo.id = 'TradeDetails';
  screenInfo.title = 'Trade Details';
  screenInfo.width = 500;
  screenInfo.height = 300;
  screenInfo.otherInfo.set('xLocation', 400);
  screenInfo.otherInfo.set('yLocation', 200);

  const jsonData = objectMapper.stringify<ScreenInfo>(screenInfo);

  t.assert(jsonData.includes('"xLocation":400'));
  t.assert(jsonData.includes('"yLocation":200'));
  t.assert(jsonData.includes('"id":"TradeDetails"'));
  t.assert(jsonData.includes('"title":"Trade Details"'));
  t.assert(jsonData.includes('"width":500'));
  t.assert(jsonData.includes('"height":300'));
});

test('Fail multi @JsonAnyGetter annotations', t => {

  const err = t.throws<JacksonError>(() => {
    class ScreenInfoWithMultiJsonAnyGetter {
      id: string;
      title: string;
      width: number;
      height: number;
      otherInfo: Map<string, any> = new Map<string, any>();

      @JsonAnyGetter({for: 'otherInfo'})
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
