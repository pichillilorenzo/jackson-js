import test from 'ava';
import {JacksonError} from '../src/core/JacksonError';
import {JsonAnyGetter} from '../src/annotations/JsonAnyGetter';
import {ObjectMapper} from '../src/databind/ObjectMapper';

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
  t.is(jsonData, '{"xLocation":400,"yLocation":200,"id":"TradeDetails","title":"Trade Details","width":500,"height":300}');
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
